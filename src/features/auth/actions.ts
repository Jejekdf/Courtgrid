"use server";

import { signIn } from "@/auth";
import {
  createLoginSchema,
  createRegisterSchema,
  createUpdateProfileSchema,
  createUpdatePasswordSchema,
  createForgotPasswordSchema,
  createResetPasswordActionSchema,
} from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/ratelimit";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadAvatar } from "@/lib/supabase/storage";
import crypto from "crypto";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { forgotPasswordEmail } from "@/lib/emails/templates";
import { getTranslations } from "next-intl/server";

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  } catch {
    return "anon";
  }
}

/**
 * Result shape for login server actions.
 */
export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

/**
 * Signs a user in with email/password via NextAuth v5.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<LoginResult> {
  const t = await getTranslations("validation");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // loginSchema.safeParse({ email, password })
  const validatedFields = createLoginSchema(t).safeParse({ email, password });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  const ip = await clientIp();
  const { success } = await checkRateLimit(`login:${ip}`);
  if (!success) {
    return { success: false, error: t("rateLimitLogin") };
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
  } catch {
    // Wrong email or password.
    return { success: false, error: t("invalidCredentials") };
  }

  const resolved = typeof result === "string" ? result : "";
  const isSuccess = resolved !== "" && !resolved.includes("error=");

  if (!isSuccess) {
    // Wrong email or password.
    return { success: false, error: t("invalidCredentials") };
  }

  if (isSuccess) {
    return { success: true, redirectTo: existingUser?.role === "ADMIN" ? "/admin" : "/dashboard" };
  }

  return { success: false, error: t("genericLoginError") };
}

export const login = authenticate;

/**
 * Creates a new customer account.
 */
export async function registerUser(formData: FormData) {
  const t = await getTranslations("validation");
  const registerInput = {
    nama: formData.get("nama") as string,
    email: formData.get("email") as string,
    no_hp: formData.get("no_hp") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = createRegisterSchema(t).safeParse(registerInput);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    };
  }

  const ip = await clientIp();
  const { success } = await checkRateLimit(`register:${ip}`);
  if (!success) {
    return { success: false, error: t("rateLimitRegister") };
  }

  const { nama, email, password } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: t("emailAlreadyRegistered"),
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
      message: t("registerSuccess"),
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      success: false,
      error: t("registerServerError"),
    };
  }
}

export async function updateProfile(formData: FormData) {
  const t = await getTranslations("validation");
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    // Not logged in.
    return { success: false, error: t("unauthorized") };
  }

  const rawInput = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    image: (formData.get("image") as string) || undefined,
  };

  // updateProfileSchema.safeParse(rawInput)
  const validation = createUpdateProfileSchema(t).safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { name, email, image } = validation.data;

  try {
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== session.user.id) {
        // Email is already used by another account.
        return { success: false, error: t("emailInUse") };
      }
    }

    const { updateUserProfileDAL } = await import("@/features/auth/dal");
    await updateUserProfileDAL(session.user.id, { name, email, image });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    // Profile updated successfully.
    return { success: true, message: t("profileUpdateSuccess") };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: t("profileUpdateServerError") };
  }
}

export async function updatePassword(formData: FormData) {
  const t = await getTranslations("validation");
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: t("unauthorized") };
  }

  const rawInput = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = createUpdatePasswordSchema(t).safeParse(rawInput);
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
      return { success: false, error: t("oauthNoLocalPassword") };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: t("currentPasswordWrong") };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const { changePasswordDAL } = await import("@/features/auth/dal");
    await changePasswordDAL(session.user.id, newHashedPassword);

    return { success: true, message: t("passwordUpdateSuccess") };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, error: t("passwordUpdateServerError") };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const t = await getTranslations("validation");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    // Avatar image is required.
    return { success: false, error: t("imageRequired") };
  }

  if (!file.type.startsWith("image/")) {
    // Must be an image (JPG/PNG/WebP).
    return { success: false, error: t("imageInvalidType") };
  }

  if (file.size > 2 * 1024 * 1024) {
    // Cap avatar size at 2MB.
    return { success: false, error: t("imageTooLarge") };
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
    return { success: true, message: t("avatarUpdateSuccess"), url };
  } catch (error) {
    console.error("Upload avatar error:", error);
    return { success: false, error: t("avatarUploadFailed") };
  }
}

export type ForgotPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function forgotPasswordAction(rawInput: unknown): Promise<ForgotPasswordResult> {
  const t = await getTranslations("validation");
  const parsed = createForgotPasswordSchema(t).safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const email = parsed.data.email.toLowerCase();

  const ip = await clientIp();
  const { success } = await checkRateLimit(`pwd_reset:${ip}_${email}`);
  if (!success) {
    return { success: false, error: t("rateLimitReset") };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true, message: t("resetLinkSent") };
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
    return { success: false, error: t("resetEmailFailed") };
  }

  return { success: true, message: t("resetLinkSent") };
}

export type ResetPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function resetPasswordAction(rawInput: unknown): Promise<ResetPasswordResult> {
  const t = await getTranslations("validation");
  const validated = createResetPasswordActionSchema(t).safeParse(rawInput);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }
  const { token, newPassword } = validated.data;

  const ip = await clientIp();
  const { success } = await checkRateLimit(`pwd_reset_submit:${ip}_${token}`);
  if (!success) {
    return { success: false, error: t("rateLimitResetSubmit") };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken) {
    return { success: false, error: t("resetLinkInvalid") };
  }

  if (new Date() > resetToken.expires) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { success: false, error: t("resetLinkExpired") };
  }

  const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return { success: false, error: t("userNotFound") };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword } }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
  ]);

  return { success: true, message: t("passwordUpdateSuccess") };
}
