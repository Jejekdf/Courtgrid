"use server";

import { signIn } from "@/auth";
import { loginSchema, registerSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate fields with Zod
  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return "Validation failed: " + validatedFields.error.issues[0].message;
  }

  // Determine redirect target based on admin role / credentials
  const envAdminEmail = process.env.ADMIN_EMAIL;
  let targetRedirect = "/";

  if (envAdminEmail && email === envAdminEmail) {
    targetRedirect = "/admin";
  } else {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    if (existingUser?.role === "ADMIN") {
      targetRedirect = "/admin";
    }
  }

  try {
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirectTo: targetRedirect,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email atau password yang Anda masukkan salah.";
        default:
          return "Terjadi kesalahan saat masuk. Silakan coba lagi.";
      }
    }
    // Re-throw Next.js redirect error so the Next.js router handles navigation
    throw error;
  }
}

export const login = authenticate;

export async function socialSignIn(provider: "google" | "facebook") {
  try {
    await signIn(provider, { redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Gagal melakukan autentikasi dengan " + provider;
    }
    throw error;
  }
}

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
