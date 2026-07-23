import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success anyway to prevent email enumeration attacks
      return NextResponse.json(
        { message: "If your email is registered, you will receive a reset link." },
        { status: 200 }
      );
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Token expires in 1 hour
    const passwordResetExpires = new Date(Date.now() + 3600000);

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email!,
        token: resetToken,
        expires: passwordResetExpires,
      },
    });

    // Send email via Resend
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const { error: resendError } = await resend.emails.send({
      from: "CourtGrid Support <support@courtgrid.com>",
      to: [user.email!],
      subject: "Reset Your CourtGrid Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
          <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
            <h3 style="margin-top: 0;">Password Reset Request</h3>
            <p>Hello ${user.name || "Customer"},</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the secure button below. This link is valid for 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color: #059669; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} CourtGrid. All rights reserved.
          </p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend Error:", resendError);
      return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 });
    }

    return NextResponse.json({ message: "Reset email sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
