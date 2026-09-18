"use server";

import { signIn } from "@/auth";
import {
  createLoginSchema,
  createRegisterSchema,
  createVerifyOtpSchema,
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
import { forgotPasswordEmail, registerOtpEmail } from "@/lib/emails/templates";
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
  const callbackUrl = formData.get("callbackUrl") as string | null;

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
    select: { role: true, emailVerified: true },
  });

  if (existingUser && !existingUser.emailVerified) {
    return { success: false, error: t("emailNotVerified") };
  }

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
    const roleTarget = existingUser?.role === "ADMIN" ? "/admin" : "/dashboard";
    const isSafeCallback = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//");
    return { success: true, redirectTo: isSafeCallback ? callbackUrl : roleTarget };
  }

  return { success: false, error: t("genericLoginError") };
}

export const login = authenticate;

/**
 * Generates, stores hashed token, and sends a 6-digit OTP email.
 */
async function issueAndSendOtp(
  recipientEmail: string,
  recipientName: string | null | undefined
): Promise<void> {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: recipientEmail },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: recipientEmail,
      token: hashedOtp,
      expires,
    },
  });

  const emailPayload = registerOtpEmail(recipientName, otp);
  try {
    await resend.emails.send({
      ...emailPayload,
      to: [recipientEmail],
    });
  } catch (mailError) {
    console.error("Resend error sending OTP:", mailError);
  }
}

/**
 * Creates a new customer account.
 */
export async function registerUser(formData: FormData) {
  const t = await getTranslations("validation");
  const registerInput = {
    nama: formData.get("nama") as string,
    email: formData.get("email") as string,
    no_hp: (formData.get("no_hp") as string) || undefined,
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
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.emailVerified) {
      return {
        success: false,
        error: t("emailAlreadyRegistered"),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.emailVerified) {
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name: nama,
          passwordHash: hashedPassword,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: nama,
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: "CUSTOMER",
          emailVerified: null,
        },
      });
    }

    await issueAndSendOtp(normalizedEmail, nama);

    return {
      success: true,
      requiresOtp: true,
      email: normalizedEmail,
      message: t("otpSent"),
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      success: false,
      error: t("registerServerError"),
    };
  }
}

export async function verifyRegisterOtp(email: string, otp: string) {
  const t = await getTranslations("validation");
  const normalizedEmail = (email || "").toLowerCase().trim();
  const cleanOtp = (otp || "").trim();

  const validated = createVerifyOtpSchema(t).safeParse({
    email: normalizedEmail,
    otp: cleanOtp,
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    };
  }

  const ip = await clientIp();
  const { success } = await checkRateLimit(`verify_otp:${ip}`);
  if (!success) {
    return { success: false, error: t("rateLimitOtp") };
  }

  const hashedOtp = crypto.createHash("sha256").update(cleanOtp).digest("hex");

  const tokenRecord = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: normalizedEmail,
        token: hashedOtp,
      },
    },
  });

  if (!tokenRecord || tokenRecord.expires < new Date()) {
    return {
      success: false,
      error: t("otpInvalidOrExpired"),
    };
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  return {
    success: true,
    message: t("registerSuccess"),
  };
}

export async function resendRegisterOtp(email: string) {
  const t = await getTranslations("validation");
  const normalizedEmail = (email || "").toLowerCase().trim();

  const ip = await clientIp();
  const { success } = await checkRateLimit(`resend_otp:${ip}_${normalizedEmail}`);
  if (!success) {
    return {
      success: false,
      error: t("rateLimitResendOtp"),
    };
  }

  const targetAccount = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!targetAccount || targetAccount.emailVerified) {
    return {
      success: false,
      error: t("emailAlreadyRegistered"),
    };
  }

  await issueAndSendOtp(normalizedEmail, targetAccount.name);

  return {
    success: true,
    message: t("otpResent"),
  };
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

  const { checkRateLimitRelaxed } = await import("@/lib/ratelimit");
  const { success: allowed } = await checkRateLimitRelaxed(`avatar_upload:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: t("rateLimitResetSubmit") };
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
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const passwordResetExpires = new Date(Date.now() + 3600000);

  await prisma.passwordResetToken.create({
    data: { email: user.email!, token: hashedToken, expires: passwordResetExpires },
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

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: hashedToken } });
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
