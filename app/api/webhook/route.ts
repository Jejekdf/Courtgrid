import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { paymentSuccessEmail } from "@/lib/emails/templates";
import Stripe from "stripe";
import { headers } from "next/headers";
import { invalidateCache } from "@/lib/redis";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook Error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only fulfill when the payment actually went through.
    if (session.payment_status !== "paid") {
      console.warn(`Webhook FIX-M4: unpaid session ${session.id} — no state change`);
      return NextResponse.json({ received: true });
    }

    // Extract reservationId from client_reference_id or metadata
    const reservationId = session.client_reference_id || session.metadata?.reservationId;

    if (!reservationId) {
      console.error("No reservationId found in session");
      return NextResponse.json(
        { error: "No reservationId" },
        { status: 400 }
      );
    }

    try {
      // Idempotent — only update if the reservation is still PENDING.
      const existingReservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        select: { status: true },
      });

      if (!existingReservation || existingReservation.status !== "PENDING") {
        console.log(`Webhook: reservasi ${reservationId} sudah diproses (status: ${existingReservation?.status}). Skip.`);
        return NextResponse.json({ received: true });
      }

      const updated = await prisma.$transaction([
        prisma.reservation.update({
          where: { id: reservationId },
          data: { status: "DP_PAID" },
          include: {
            user: true,
            court: true,
            payment: true,
          },
        }),
        prisma.payment.update({
          where: { reservationId: reservationId },
          data: { status: "VERIFIED" },
        }),
      ]);

      const reservation = updated[0];

      // Send payment confirmation email (non-blocking)
      if (reservation.user?.email) {
        const dateStr = reservation.date.toISOString().split("T")[0];
        const startTime = reservation.startTime.toISOString().split("T")[1]?.slice(0, 5) ?? "";
        const endTime = reservation.endTime.toISOString().split("T")[1]?.slice(0, 5) ?? "";

        resend.emails.send({
          ...paymentSuccessEmail({
            userName: reservation.user.name,
            userEmail: reservation.user.email,
            courtName: reservation.court?.name ?? "Lapangan",
            dateStr,
            startTime,
            endTime,
            totalPrice: reservation.totalPrice,
            dpAmount: reservation.payment?.dpAmount ?? 0,
            reservationId: reservation.id,
          }),
          from: RESEND_FROM_EMAIL,
        }).catch((emailError) => {
          logger.error("Webhook:Email", "Failed to send payment success email", emailError, { reservationId });
        });
      }

      logger.info("Webhook:Success", `Payment verified and reservation ${reservationId} updated to DP_PAID.`, { reservationId });

      // Invalidate Redis cache for admin stats
      await invalidateCache("admin:dashboard:stats");

      // Revalidate admin and dashboard caches
      revalidatePath("/admin");
      revalidatePath("/admin/reservations");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/reservations");
    } catch (dbError) {
      logger.error("Webhook:Database", "Database Error updating reservation", dbError, { reservationId });
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
