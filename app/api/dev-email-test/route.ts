import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { bookingConfirmationEmail, paymentSuccessEmail, forgotPasswordEmail } from "@/lib/emails/templates";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
      const user = await prisma.user.findFirst();

      if (!user?.email) {
        return NextResponse.json(
          { ok: false, error: "No user found in database. Register a user first." },
          { status: 400 }
        );
      }

      const resetToken = "local-test-token-" + Date.now();
      const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
          <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
            <h3 style="margin-top: 0;">Password Reset Request</h3>
            <p>Hello ${user.name || "Customer"},</p>
            <p>This is a local test email. Click the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this URL:<br>
              <a href="${resetUrl}" style="color: #059669; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} CourtGrid. All rights reserved.
          </p>
        </div>
      `;

      const { error: emailError } = await resend.emails.send({
        ...forgotPasswordEmail(user.name, resetUrl),
        from: RESEND_FROM_EMAIL,
        to: [user.email],
        subject: "Reset Your CourtGrid Password",
        html: emailHtml,
      });

      if (emailError) {
        return NextResponse.json({ ok: false, error: emailError }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: `Forgot password email sent to ${user.email}.` });
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
