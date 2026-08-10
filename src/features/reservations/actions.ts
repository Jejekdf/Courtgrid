"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { verifyUserSession } from "@/features/auth/dal";
import { getReservationDetailsDAL } from "@/features/reservations/dal";
import { createReservationSchema, cancelReservationSchema } from "@/features/reservations/schemas";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { bookingConfirmationEmail } from "@/lib/emails/templates";
import { validateBookingTime } from "@/lib/timezone";
import {
  ACTIVE_BOOKING_STATUSES,
  computeDeposit,
} from "@/features/reservations/doubleBooking";

/**
 * Server Action: Create Reservation & Stripe Checkout Session (RFC-011 / F6 / F7)
 *
 * Pipeline (DM-4, PAY-1, PAY-2, STYLE-3):
 * 1. Zod safeParse (DM-7)
 * 2. verifyUserSession (SEC-2)
 * 3. timezone/past-date re-check (RFC-003 / FIX-H2)
 * 4. court exists + active (DM-5, 404 explicit)
 * 5. server-side price recompute (PAY-1 anti-pattern)
 * 6. atomic overlap query + create in one $transaction (DM-4, F6)
 * 7. Stripe Checkout session (RFC-012 / F7)
 * 8. email fire-and-forget + revalidatePath
 * 9. typed { success, url } result
 */
export async function createReservationAction(rawInput: unknown) {
  // Layer 1: Strict Zod Validation (DM-7)
  const validation = createReservationSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  // Layer 2: Auth verification (SEC-2, STYLE-3)
  let user;
  try {
    user = await verifyUserSession();
  } catch {
    return {
      success: false,
      error: "Silakan masuk (login) ke akun Anda terlebih dahulu.",
    };
  }

  // Layer 3: Server-side timezone/past-date re-check (RFC-003, AC-TZ-3)
  const { courtId, dateStr, startTime, endTime } = validation.data;
  const tzError = validateBookingTime(dateStr, startTime);
  if (tzError) {
    return { success: false, error: tzError };
  }

  // Layer 4: Court exists + active (DM-5, 404 explicit — user req)
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    select: { id: true, name: true, pricePerHour: true, isActive: true },
  });

  if (!court) {
    return { success: false, error: "Lapangan tidak ditemukan." };
  }

  if (!court.isActive) {
    return { success: false, error: "Lapangan ini sedang tidak aktif." };
  }

  // Layer 5: Server-side price recompute (PAY-1 anti-pattern — never trust client price)
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);
  const duration = endHour - startHour;
  const totalPrice = court.pricePerHour * duration;
  const dpAmount = computeDeposit(totalPrice);

  const date = new Date(dateStr);
  const startDateTime = new Date(`${dateStr}T${startTime}:00`);
  const endDateTime = new Date(`${dateStr}T${endTime}:00`);

  // Layer 6: Atomic overlap check + create (DM-4, F6)
  // Both happen inside one interactive $transaction so they are one atomic unit.
  // P2002 backstop catches the same-startTime race (DM-4).
  let reservationId: string;
  try {
    const reservation = await prisma.$transaction(async (tx) => {
      // Atomic overlap query — half-open interval [start, end)
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
        throw new DoubleBookingError(
          "Slot waktu ini sudah dipesan. Silakan pilih jam lain.",
        );
      }

      // No overlap — create reservation + payment atomically
      return tx.reservation.create({
        data: {
          userId: user.id,
          courtId,
          date,
          startTime: startDateTime,
          endTime: endDateTime,
          totalPrice,
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
    if (error instanceof DoubleBookingError) {
      return { success: false, error: error.message };
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Slot waktu ini baru saja dipesan. Silakan pilih jam lain." };
    }
    console.error("Create reservation action error:", error);
    return { success: false, error: "Terjadi kesalahan server saat memproses booking." };
  }

  // Layer 7: Stripe Checkout session (RFC-012 / F7)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
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

  // Layer 8: Fire-and-forget email + explicit cache invalidation
  resend.emails.send({
    ...bookingConfirmationEmail({
      userName: user.name,
      userEmail: user.email,
      courtName: court.name,
      dateStr,
      startTime,
      endTime,
      totalPrice,
      dpAmount,
      reservationId,
    }),
    from: RESEND_FROM_EMAIL,
  }).catch((emailError) => {
    console.error("Failed to send booking confirmation email:", emailError);
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");

  // Layer 9: typed result
  return { success: true, url: checkoutSession.url };
}

/**
 * Layer 6 helper: typed error for double-booking overlap (not P2002 race).
 * Used inside $transaction to abort with a user-friendly id-ID message.
 */
class DoubleBookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DoubleBookingError";
  }
}

/**
 * Server Action: Cancel Pending Reservation
 */
export async function cancelReservationAction(rawInput: unknown) {
  const validation = cancelReservationSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { reservationId } = validation.data;

  const reservation = await getReservationDetailsDAL(reservationId);
  if (!reservation) {
    return { success: false, error: "Reservasi tidak ditemukan." };
  }

  if (reservation.status !== "PENDING") {
    return { success: false, error: "Hanya pesanan berstatus PENDING yang dapat dibatalkan." };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");

  return { success: true, message: "Pesanan berhasil dibatalkan." };
}
