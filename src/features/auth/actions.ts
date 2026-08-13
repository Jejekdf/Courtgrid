"use server";

import { signIn } from "@/auth";
import { loginSchema, registerSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/ratelimit";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/zod";
import { uploadAvatar } from "@/lib/supabase/storage";
import crypto from "crypto";
import { z } from "zod";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { forgotPasswordEmail } from "@/lib/emails/templates";



async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  } catch {
    return "anon";
  }
}

/**
 * Represents the return type for login server actions.
 */
export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

/**
 * Authenticates a user using email/password credentials via NextAuth v5.
 *
 * This action:
 * - Validates input using the login Zod schema.
 * - Looks up the user role for post-login redirection.
 * - Calls `signIn("credentials", ...)` and normalizes the v5 server-action
 *   return shape, which may be a redirect URL string rather than `{ ok: true }`.
 * - Catches `CredentialsSignin` errors so the client receives a friendly message
 *   instead of a 500 stack trace.
 *
 * @param prevState - unused; kept to satisfy Next.js server-action signature.
 * @param formData - form payload containing `email` and `password`.
 * @returns Login result with either `redirectTo` or an `error` message.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return { success: false, error: "Validation failed: " + validatedFields.error.issues[0].message };
  }

  const ip = await clientIp();
  const { success } = await checkRateLimit(`login:${ip}`);
  if (!success) {
    return { success: false, error: "Terlalu banyak percobaan masuk. Silakan coba lagi dalam 15 menit." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: validatedFields.data.email },
    select: { role: true },
  });

  let result: unknown;

  try {
    result = await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });
  } catch (error) {
    return { success: false, error: "Email atau password yang Anda masukkan salah." };
  }

  // In NextAuth v5 server actions, `signIn(..., { redirect: false })` returns
  // the resolved redirect URL as a string. On credential failure this typically
  // contains the signin error query (e.g. `?error=CredentialsSignin`).
  const resolved = typeof result === "string" ? result : "";
  const isSuccess = resolved !== "" && !resolved.includes("error=");

  if (!isSuccess) {
    return { success: false, error: "Email atau password yang Anda masukkan salah." };
  }

  if (isSuccess) {
    return { success: true, redirectTo: existingUser?.role === "ADMIN" ? "/admin" : "/dashboard" };
  }

  return { success: false, error: "Terjadi kesalahan saat masuk. Silakan coba lagi." }
}

export const login = authenticate;


/**
 * Registers a new customer account.
 *
 * - Validates input against `registerSchema`.
 * - Ensures email uniqueness.
 * - Hashes the password before persisting.
 *
 * @param formData - form payload containing `nama`, `email`, `no_hp`, `password`, and `confirmPassword`.
 * @returns Registration outcome with `success`, optional `message`, or `error`.
 */
export async function registerUser(formData: FormData) {
  const rawData = {
    nama: formData.get("nama") as string,
    email: formData.get("email") as string,
    no_hp: formData.get("no_hp") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = registerSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    };
  }

  const ip = await clientIp();
  const { success } = await checkRateLimit(`register:${ip}`);
  if (!success) {
    return { success: false, error: "Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam 15 menit." };
  }

  const { nama, email, password } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email sudah terdaftar. Silakan gunakan email lain atau masuk.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: nama,
        email,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return {
      success: true,
      message: "Pendaftaran akun berhasil! Silakan masuk ke akun Anda.",
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server saat mendaftar. Silakan coba lagi.",
    };
  }
}



export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const rawInput = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    image: (formData.get("image") as string) || undefined,
  };

  const validation = updateProfileSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { name, email, image } = validation.data;

  try {
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== session.user.id) {
        return { success: false, error: "Email sudah digunakan oleh akun lain." };
      }
    }

    const { updateUserProfileDAL } = await import("@/features/auth/dal");
    await updateUserProfileDAL(session.user.id, { name, email, image });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true, message: "Profil akun berhasil diperbarui." };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Terjadi kesalahan server saat memperbarui profil." };
  }
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const rawInput = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = updatePasswordSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { currentPassword, newPassword } = validation.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Pengguna ini tidak memiliki password lokal (Gunakan login Social/OAuth)." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Password saat ini salah." };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const { changePasswordDAL } = await import("@/features/auth/dal");
    await changePasswordDAL(session.user.id, newHashedPassword);

    return { success: true, message: "Password berhasil diubah!" };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, error: "Terjadi kesalahan server saat mengubah password." };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "File gambar wajib diisi." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File harus berupa gambar (JPG/PNG/WebP)." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Ukuran file maksimal 2MB." };
  }

  try {
    const url = await uploadAvatar(session.user.id, file);

    const { updateUserProfileDAL } = await import("@/features/auth/dal");
    await updateUserProfileDAL(session.user.id, {
      name: session.user.name || "",
      email: session.user.email || "",
      image: url,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true, message: "Avatar berhasil diperbarui.", url };
  } catch (error) {
    console.error("Upload avatar error:", error);
    return { success: false, error: "Gagal mengupload avatar." };
  }
}


export type ForgotPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

const forgotPasswordSchema = z.object({
  email: z.email("Email tidak valid."),
});

export async function forgotPasswordAction(rawInput: unknown): Promise<ForgotPasswordResult> {
  const parsed = forgotPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const email = parsed.data.email.toLowerCase();

  const ip = await clientIp();
  const { success } = await checkRateLimit(`pwd_reset:${ip}_${email}`);
  if (!success) {
    return { success: false, error: "Terlalu banyak permintaan reset password. Silakan coba lagi dalam 15 menit." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true, message: "Tautan reset kata sandi telah dikirim ke email Anda." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetExpires = new Date(Date.now() + 3600000);

  await prisma.passwordResetToken.create({
    data: { email: user.email!, token: resetToken, expires: passwordResetExpires },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
  const emailPayload = forgotPasswordEmail(user.name, resetUrl);

  const { error: resendError } = await resend.emails.send({
    ...emailPayload,
    from: RESEND_FROM_EMAIL,
    to: [user.email!],
  });

  if (resendError) {
    console.error("Resend Error:", resendError);
    return { success: false, error: "Gagal mengirim email reset. Silakan coba lagi." };
  }

  return { success: true, message: "Tautan reset kata sandi telah dikirim ke email Anda." };
}

export type ResetPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .regex(/[A-Z]/, "Tambahkan minimal 1 huruf besar (A-Z).")
    .regex(/[a-z]/, "Tambahkan minimal 1 huruf kecil (a-z).")
    .regex(/[0-9]/, "Tambahkan minimal 1 angka (0-9).")
    .regex(/[^A-Za-z0-9]/, "Tambahkan minimal 1 karakter spesial (!@#$%^&*) untuk keamanan ekstra."),
});

export async function resetPasswordAction(rawInput: unknown): Promise<ResetPasswordResult> {
  const validated = resetPasswordSchema.safeParse(rawInput);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }
  const { token, newPassword } = validated.data;

  const ip = await clientIp();
  const { success } = await checkRateLimit(`pwd_reset_submit:${ip}_${token}`);
  if (!success) {
    return { success: false, error: "Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken) {
    return { success: false, error: "Tautan reset tidak valid." };
  }

  if (new Date() > resetToken.expires) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { success: false, error: "Tautan reset sudah kadaluarsa. Silakan ajukan ulang." };
  }

  const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return { success: false, error: "Pengguna tidak ditemukan." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword } }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
  ]);

  return { success: true, message: "Password berhasil diperbarui." };
}
