"use server";

import {
  ACTIVE_BOOKING_STATUSES,
  computeDeposit,
} from "@/features/reservations/doubleBooking";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { verifyUserSession } from "@/features/auth/dal";
import { getReservationDetailsDAL } from "@/features/reservations/dal";
import {
  createReservationSchema,
  createCancelReservationSchema,
} from "@/features/reservations/schemas";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { bookingConfirmationEmail } from "@/lib/emails/templates";
import { validateBookingTime } from "@/lib/timezone";
import { auth } from "@/auth";
import { uploadPaymentProof, getPaymentProofSignedUrl } from "@/lib/supabase/storage";
import { getTranslations } from "next-intl/server";

/**
 * Creates a reservation and redirects the user to Stripe Checkout for the down payment.
 */
export async function createReservationAction(rawInput: unknown) {
  const t = await getTranslations("validation");

  // 1. Validate every field again on the server.
  const bookingInput = createReservationSchema(t).safeParse(rawInput);
  if (!bookingInput.success) {
    return {
      success: false,
      error: bookingInput.error.issues[0].message,
    };
  }

  // 2. Make sure the user is logged in.
  let user;
  try {
    user = await verifyUserSession();
  } catch {
    return {
      success: false,
      error: t("unauthorized"),
    };
  }

  // 3. Reject dates/hours that have already passed (Asia/Jakarta, not the client's clock).
  const { courtId, dateStr, startTime, endTime, voucherCode } = bookingInput.data;
  const tzError = validateBookingTime(dateStr, startTime, t);
  if (tzError) {
    return { success: false, error: tzError };
  }

  // 4. The court must exist and be active.
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    select: { id: true, name: true, pricePerHour: true, isActive: true },
  });

  if (!court) {
    // Court not found
    return { success: false, error: t("courtNotFound") };
  }

  if (!court.isActive) {
    // Court is currently inactive
    return { success: false, error: t("courtInactive") };
  }

  // 5. Recompute the price server-side (never trust client numbers), then apply a voucher if given.
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);
  const duration = endHour - startHour;
  const originalTotalPrice = court.pricePerHour * duration;
  let finalTotalPrice = originalTotalPrice;
  let appliedVoucherId: string | undefined;

  if (voucherCode && voucherCode.trim()) {
    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode.trim().toUpperCase() },
    });

    if (!voucher || !voucher.isActive) {
      return { success: false, error: t("voucherInvalid") };
    }

    if (voucher.expiresAt < new Date()) {
      return { success: false, error: t("voucherExpired") };
    }

    if (originalTotalPrice < voucher.minSpend) {
      return {
        success: false,
        error: t("voucherMinSpend", { minSpend: voucher.minSpend.toLocaleString("id-ID") }),
      };
    }

    const discountAmount = Math.min(
      Math.round((originalTotalPrice * voucher.discountPct) / 100),
      voucher.maxDiscount ?? Infinity,
    );

    finalTotalPrice = Math.max(0, originalTotalPrice - discountAmount);
    appliedVoucherId = voucher.id;
  }

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const startDateTime = new Date(`${dateStr}T${startTime}:00.000Z`);
  const endDateTime = new Date(`${dateStr}T${endTime}:00.000Z`);

  // 5b. Down-payment percentage from Settings (default 50%).
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  const dpPercentage = setting?.dpPercentage ?? 50;

  const dpAmount = computeDeposit(finalTotalPrice, dpPercentage);

  // 6. Check for overlap inside a transaction so the slot can't be double-booked,
  //    then create the reservation and its payment record together.
  let reservationId: string;
  try {
    const reservation = await prisma.$transaction(async (tx) => {
      // Half-open interval [start, end): adjacent slots don't collide.
      const overlap = await tx.reservation.findFirst({
        where: {
          courtId,
          date,
          status: { in: [...ACTIVE_BOOKING_STATUSES] },
          startTime: { lt: endDateTime },
          endTime: { gt: startDateTime },
        },
        select: { id: true },
      });

      if (overlap) {
        throw new ReservationGuardError(t("doubleBooked"));
      }

      // Voucher redemption limit: count prior non-canceled usages inside this
      // transaction so two concurrent checkouts can't exceed max_uses.
      if (appliedVoucherId) {
        const [usedCount, voucher] = await Promise.all([
          tx.reservation.count({
            where: { voucherId: appliedVoucherId, status: { not: "CANCELED" } },
          }),
          tx.voucher.findUnique({
            where: { id: appliedVoucherId },
            select: { maxUses: true },
          }),
        ]);

        if (voucher && usedCount >= voucher.maxUses) {
          throw new ReservationGuardError(t("voucherAlreadyUsed"));
        }
      }

      // No overlap — create reservation + payment atomically
      return tx.reservation.create({
        data: {
          userId: user.id,
          courtId,
          date,
          startTime: startDateTime,
          endTime: endDateTime,
          totalPrice: finalTotalPrice,
          voucherId: appliedVoucherId,
          status: "PENDING",
          payment: {
            create: {
              dpAmount,
              status: "PENDING",
            },
          },
        },
        select: { id: true },
      });
    });

    reservationId = reservation.id;
  } catch (error) {
    if (error instanceof ReservationGuardError) {
      return { success: false, error: error.message };
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      // Caught by the DB unique constraint — someone else just booked this slot.
      return { success: false, error: t("doubleBookedRace") };
    }
    console.error("Create reservation action error:", error);
    return { success: false, error: t("bookingServerError") };
  }

  // 7. Create the Stripe Checkout session and attach it to the reservation.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${appUrl}/dashboard/book?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/book?payment=cancel`,
      client_reference_id: reservationId,
      metadata: { reservationId },
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: "DP Booking Lapangan CourtGrid",
              description: `Tanggal: ${dateStr}, Jam: ${startTime} - ${endTime}`,
            },
            unit_amount: dpAmount * 100,
          },
          quantity: 1,
        },
      ],
    });

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { stripeSessionId: checkoutSession.id },
    });
  } catch (stripeError) {
    console.error("Stripe Checkout Error:", stripeError);
    // Cleanup the pending reservation if Stripe fails
    await prisma.reservation.delete({ where: { id: reservationId } });
    return { success: false, error: t("stripeError") };
  }

  // 8. Confirmation email is fire-and-forget; then invalidate caches and revalidate the affected routes.
  resend.emails.send({
    ...bookingConfirmationEmail({
      userName: user.name,
      userEmail: user.email,
      courtName: court.name,
      dateStr,
      startTime,
      endTime,
      totalPrice: finalTotalPrice,
      dpAmount,
      reservationId,
    }),
    from: RESEND_FROM_EMAIL,
  }).catch((emailError) => {
    console.error("Failed to send booking confirmation email:", emailError);
  });

  const { invalidateCache } = await import("@/lib/redis");
  await invalidateCache(`customer:${user.id}:reservations`, "admin:dashboard:stats");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");

  // 9. Return the checkout URL so the client can redirect.
  return { success: true, url: checkoutSession.url };
}

/**
 * Thrown inside the booking transaction when a guard (slot overlap,
 * exhausted voucher) rejects the reservation with a user-facing message.
 */
class ReservationGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationGuardError";
  }
}

/**
 * Cancels a reservation while it is still unpaid.
 */
export async function cancelReservationAction(rawInput: unknown) {
  const t = await getTranslations("validation");
  const validation = createCancelReservationSchema(t).safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { reservationId } = validation.data;

  const reservation = await getReservationDetailsDAL(reservationId);
  if (!reservation) {
    return { success: false, error: t("reservationNotFound") };
  }

  // Atomic guard on status: if the webhook flips the reservation to DP_PAID
  // between the check above and this write, the update matches nothing and a
  // paid booking is never wiped by a cancel.
  const updated = await prisma.reservation.updateMany({
    where: { id: reservationId, status: "PENDING" },
    data: { status: "CANCELED" },
  });

  if (updated.count === 0) {
    return { success: false, error: t("cancelOnlyPending") };
  }

  const { invalidateCache } = await import("@/lib/redis");
  if (reservation.userId) {
    await invalidateCache(`customer:${reservation.userId}:reservations`, "admin:dashboard:stats");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");

  return { success: true, message: t("cancelSuccess") };
}

export async function uploadPaymentProofAction(formData: FormData) {
  const t = await getTranslations("validation");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  const { checkRateLimitRelaxed } = await import("@/lib/ratelimit");
  const { success: allowed } = await checkRateLimitRelaxed(`proof_upload:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: t("rateLimitResetSubmit") };
  }

  const reservationId = formData.get("reservationId") as string;
  const file = formData.get("file") as File | null;

  if (!reservationId || !file) {
    return { success: false, error: t("proofFileRequired") };
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { userId: true, id: true },
    });

    if (!reservation || reservation.userId !== session.user.id) {
      return { success: false, error: t("reservationNotFound") };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: t("proofImageInvalid") };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: t("proofFileTooLarge") };
    }

    const path = await uploadPaymentProof(reservationId, file);

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { paymentProofUrl: path },
    });

    revalidatePath("/dashboard/reservations");
    revalidatePath(`/dashboard/reservations/${reservationId}`);

    const url = (await getPaymentProofSignedUrl(path)) ?? path;

    return { success: true, message: t("proofUploadSuccess"), url };
  } catch (error) {
    console.error("Upload payment proof error:", error);
    return { success: false, error: t("proofUploadFailed") };
  }
}

export type CustomerNotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  link: string;
};

export async function customerGetNotifications(): Promise<
  | { success: false; notifications: never[] }
  | { success: true; notifications: CustomerNotificationItem[] }
> {
  let user;
  try {
    user = await verifyUserSession();
  } catch {
    return { success: false, notifications: [] };
  }

  const pending = await prisma.reservation.findMany({
    where: { userId: user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, createdAt: true, court: { select: { name: true } } },
  });

  const notifications = pending.map((r) => ({
    id: r.id,
    title: "Menunggu Pembayaran DP",
    message: `Reservasi ${r.court?.name || "Lapangan"} menunggu DP`,
    time: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    link: "/dashboard/reservations",
  }));

  return { success: true, notifications };
}
