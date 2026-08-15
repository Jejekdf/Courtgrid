import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { bookingConfirmationEmail, paymentSuccessEmail, forgotPasswordEmail } from "@/lib/emails/templates";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { success } = await checkRateLimit(`dev-email-test:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam 15 menit." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { type, email } = body as { type?: string; email?: string };

    const targetEmail = email || "delivered@resend.dev";

    if (type === "booking-confirmation") {
      const { data, error } = await resend.emails.send({
        ...bookingConfirmationEmail({
          userName: "Test Customer",
          userEmail: targetEmail,
          courtName: "Lapangan Futsal A",
          dateStr: "2026-07-29",
          startTime: "18:00",
          endTime: "19:00",
          totalPrice: 100000,
          dpAmount: 50000,
          reservationId: "local-test-001",
        }),
        from: RESEND_FROM_EMAIL,
      });

      if (error) {
        return NextResponse.json({ ok: false, error }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data, message: "Booking confirmation email sent." });
    }

    if (type === "payment-success") {
      const { data, error } = await resend.emails.send({
        ...paymentSuccessEmail({
          userName: "Test Customer",
          userEmail: targetEmail,
          courtName: "Lapangan Futsal A",
          dateStr: "2026-07-29",
          startTime: "18:00",
          endTime: "19:00",
          totalPrice: 100000,
          dpAmount: 50000,
          reservationId: "local-test-001",
        }),
        from: RESEND_FROM_EMAIL,
      });

      if (error) {
        return NextResponse.json({ ok: false, error }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data, message: "Payment success email sent." });
    }

    if (type === "forgot-password") {
      const resetToken = "local-test-token-" + Date.now();
      const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

      const { error: emailError } = await resend.emails.send({
        ...forgotPasswordEmail("Test Customer", resetUrl),
        from: RESEND_FROM_EMAIL,
        to: [targetEmail],
        subject: "Reset Your CourtGrid Password",
      });

      if (emailError) {
        return NextResponse.json({ ok: false, error: emailError }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: `Forgot password email sent to ${targetEmail}.` });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid type. Use: booking-confirmation | payment-success | forgot-password" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Dev email test error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
