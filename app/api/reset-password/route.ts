import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getRateLimiter } from "@/lib/ratelimit";

const rateLimiter = getRateLimiter();

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .regex(/[A-Z]/, "Tambahkan minimal 1 huruf besar (A-Z).")
    .regex(/[a-z]/, "Tambahkan minimal 1 huruf kecil (a-z).")
    .regex(/[0-9]/, "Tambahkan minimal 1 angka (0-9).")
    .regex(
      /[^A-Za-z0-9]/,
      "Tambahkan minimal 1 karakter spesial (!@#$%^&*) untuk keamanan ekstra."
    ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validated = resetPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, newPassword } = validated.data;

    const clientIp = req.headers.get("x-forwarded-for") || "client_ip";
    const rateLimitKey = `pwd_reset_submit:${clientIp}_${token}`;

    if (rateLimiter) {
      const { success } = await rateLimiter.limit(rateLimitKey);

      if (!success) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit." },
          { status: 429 }
        );
      }
    }

    // Find the token in the database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Tautan reset tidak valid." },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: "Tautan reset sudah kadaluarsa. Silakan ajukan ulang." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and delete reset token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return NextResponse.json(
      { message: "Password berhasil diperbarui." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
