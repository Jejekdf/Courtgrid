import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract reservationId from client_reference_id or metadata
    const reservationId = session.client_reference_id || session.metadata?.reservationId;

    if (reservationId) {
      try {
        await prisma.$transaction([
          prisma.reservation.update({
            where: { id: reservationId },
            data: { status: "DP_PAID" },
          }),
          prisma.payment.update({
            where: { reservationId: reservationId },
            data: { status: "VERIFIED" },
          }),
        ]);
        console.log(`Payment verified and reservation ${reservationId} updated to DP_PAID.`);
      } catch (dbError) {
        console.error("Database Error updating reservation:", dbError);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 }
        );
      }
    } else {
      console.error("No reservationId found in session");
      return NextResponse.json(
        { error: "No reservationId" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
