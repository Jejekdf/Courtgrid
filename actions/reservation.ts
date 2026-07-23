"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function createReservation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { 
      success: false, 
      error: "Silakan masuk (login) ke akun Anda terlebih dahulu untuk melakukan reservasi dan pembayaran DP." 
    };
  }

  const userId = session.user.id;
  const courtId = formData.get("courtId") as string;
  const dateStr = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const totalPrice = parseInt(formData.get("totalPrice") as string, 10);

  if (!courtId || !dateStr || !startTime || !endTime || isNaN(totalPrice)) {
    return { success: false, error: "Field data reservasi tidak lengkap." };
  }

  const date = new Date(dateStr);

  try {
    // 1. Strict Validation: Check for Double Booking
    const existingReservations = await prisma.reservation.findMany({
      where: {
        courtId,
        date,
        status: {
          in: ["PENDING", "DP_PAID"],
        },
        OR: [
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
        ],
      },
    });

    if (existingReservations.length > 0) {
      return { success: false, error: "Waktu ini sudah dibooking. Silakan pilih waktu lain." };
    }

    const dpAmount = Math.ceil(totalPrice / 2);

    // 2. Create Reservation & Payment Record via Transaction
    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
          userId,
          courtId,
          date,
          startTime,
          endTime,
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

    // 3. Create Stripe Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      client_reference_id: reservation.id,
      metadata: {
        reservationId: reservation.id,
      },
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

    // 4. Update Reservation with Stripe Session ID
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    revalidatePath("/");
    revalidatePath("/admin/reservations");

    return { success: true, url: checkoutSession.url };
  } catch (error: any) {
    console.error("Booking error:", error);
    return { success: false, error: "Terjadi kesalahan pada server saat membuat booking." };
  }
}
