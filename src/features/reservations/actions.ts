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

/**
 * Server Action: Create Reservation & Stripe Checkout Session
 */
export async function createReservationAction(rawInput: unknown) {
  // Layer 1: Strict Zod Validation
  const validation = createReservationSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  // Layer 2: Authoritative Server-Side Timezone Validation (DM-3, SEC-8)
  const { courtId, dateStr, startTime, endTime, totalPrice } = validation.data;
  const tzError = validateBookingTime(dateStr, startTime);
  if (tzError) {
    return { success: false, error: tzError };
  }

  // Layer 3: Auth Verification via DAL
  const user = await verifyUserSession();
  const date = new Date(dateStr);
  const startDateTime = new Date(`${dateStr}T${startTime}:00`);
  const endDateTime = new Date(`${dateStr}T${endTime}:00`);

  try {
    // Check Double Booking
    const existingReservations = await prisma.reservation.findMany({
      where: {
        courtId,
        date,
        status: { in: ["PENDING", "DP_PAID"] },
        OR: [
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gt: startDateTime } },
            ],
          },
        ],
      },
    });

    if (existingReservations.length > 0) {
      return { success: false, error: "Slot waktu ini sudah dipesan. Silakan pilih jam lain." };
    }

    const dpAmount = Math.ceil(totalPrice / 2);

    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
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
      }),
    ]);

    // Create Stripe Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      client_reference_id: reservation.id,
      metadata: { reservationId: reservation.id },
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
      where: { id: reservation.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    // Send booking confirmation email (fire-and-forget; non-blocking for UX)
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    resend.emails.send({
      ...bookingConfirmationEmail({
        userName: user.name,
        userEmail: user.email,
        courtName: court?.name ?? "Lapangan",
        dateStr,
        startTime,
        endTime,
        totalPrice,
        dpAmount,
        reservationId: reservation.id,
      }),
      from: RESEND_FROM_EMAIL,
    }).catch((emailError) => {
      console.error("Failed to send booking confirmation email:", emailError);
    });

    // Layer 4: Explicit Cache Invalidation
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reservations");
    revalidatePath("/admin");
    revalidatePath("/admin/reservations");

    return { success: true, url: checkoutSession.url };
  } catch (error) {
    console.error("Create reservation action error:", error);
    // Handle unique constraint violation for double booking
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Slot waktu ini baru saja dipesan. Silakan pilih jam lain." };
    }
    return { success: false, error: "Terjadi kesalahan server saat memproses booking." };
  }
}

/**
 * Server Action: Cancel Pending Reservation
 */
export async function cancelReservationAction(rawInput: unknown) {
  // Layer 1: Strict Zod Validation
  const validation = cancelReservationSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { reservationId } = validation.data;

  // Layer 2: Ownership & IDOR Protection via DAL
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

  // Layer 3: Explicit Cache Invalidation
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");

  return { success: true, message: "Pesanan berhasil dibatalkan." };
}
