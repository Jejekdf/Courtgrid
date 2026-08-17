import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaTranslator = (key: any, values?: any) => string;

const defaultValidationMessages: Record<string, string> = {
  emailRequired: "Email wajib diisi",
  emailInvalid: "Format email tidak valid. Contoh: kamu@email.com",
  passwordRequired: "Password wajib diisi",
  passwordMin8: "Password Minimal 8 Karakter. Tambahkan kombinasi huruf besar, kecil, angka, dan simbol.",
  passwordMin: "Password minimal 8 karakter",
  nameRequired: "Nama lengkap wajib diisi",
  nameTooShort: "Nama terlalu pendek. Minimal 2 karakter.",
  nameTooLong: "Nama terlalu panjang. Maksimal 50 karakter.",
  phoneRequired: "Nomor HP wajib diisi",
  phoneInvalid: "Format nomor HP tidak valid. Harus 10-15 digit angka serta bisa diawali +62.",
  passwordReqUpper: "Agar lebih aman, tambahkan minimal 1 huruf besar (A-Z).",
  passwordReqLower: "Tambahkan minimal 1 huruf kecil (a-z).",
  passwordReqDigit: "Tambahkan minimal 1 angka (0-9).",
  passwordReqSpecial: "Tambahkan minimal 1 karakter spesial (!@#$%^&*) untuk keamanan ekstra.",
  confirmPasswordRequired: "Konfirmasi password wajib diisi",
  confirmPasswordMismatch: "Konfirmasi password tidak cocok. Cek kembali password yang kamu masukkan.",
  currentPasswordRequired: "Password saat ini wajib diisi",
  newPasswordMin: "Password baru minimal 8 karakter",
  confirmNewPasswordRequired: "Konfirmasi password baru wajib diisi",
  confirmNewPasswordMismatch: "Konfirmasi password baru tidak cocok. Cek kembali password yang kamu masukkan.",
  tokenRequired: "Token wajib diisi",
  courtRequired: "Lapangan wajib dipilih.",
  dateRequired: "Tanggal wajib diisi.",
  startTimeInvalid: "Format waktu mulai tidak valid. Contoh: 14:00",
  endTimeInvalid: "Format waktu selesai tidak valid. Contoh: 15:00",
  totalPricePositive: "Total harga harus lebih dari 0.",
  endTimeAfterStart: "Waktu selesai harus lebih besar dari waktu mulai.",
  pastDate: "Tidak bisa memesan untuk tanggal yang sudah lewat.",
  pastHour: "Tidak bisa memesan untuk jam yang sudah lewat. Pilih jam setelah jam berikutnya.",
  reservationIdRequired: "ID Reservasi wajib diisi.",
};

export const defaultTranslator: SchemaTranslator = (key, values) => {
  let msg = defaultValidationMessages[key] || key;
  if (values && typeof values === "object") {
    Object.entries(values).forEach(([k, v]) => {
      msg = msg.replace(`{${k}}`, String(v));
    });
  }
  return msg;
};

export function createLoginSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .and(z.email(t("emailInvalid"))),
    password: z
      .string()
      .min(1, t("passwordRequired"))
      .min(8, t("passwordMin8")),
  });
}

export const loginSchema = createLoginSchema();
export type LoginInput = z.infer<typeof loginSchema>;

export function createRegisterSchema(t: SchemaTranslator = defaultTranslator) {
  return z
    .object({
      nama: z
        .string()
        .min(1, t("nameRequired"))
        .min(2, t("nameTooShort")),
      email: z
        .string()
        .min(1, t("emailRequired"))
        .and(z.email(t("emailInvalid"))),
      no_hp: z
        .string()
        .min(1, t("phoneRequired"))
        .regex(/^[0-9+\-\s]{10,15}$/, t("phoneInvalid")),
      password: z
        .string()
        .min(8, t("passwordMin"))
        .regex(/[A-Z]/, t("passwordReqUpper"))
        .regex(/[a-z]/, t("passwordReqLower"))
        .regex(/[0-9]/, t("passwordReqDigit"))
        .regex(/[^A-Za-z0-9]/, t("passwordReqSpecial")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPasswordMismatch"),
      path: ["confirmPassword"],
    });
}

export const registerSchema = createRegisterSchema();
export type RegisterInput = z.infer<typeof registerSchema>;

export function createUpdatePasswordSchema(t: SchemaTranslator = defaultTranslator) {
  return z
    .object({
      currentPassword: z.string().min(1, t("currentPasswordRequired")),
      newPassword: z
        .string()
        .min(8, t("newPasswordMin"))
        .regex(/[A-Z]/, t("passwordReqUpper"))
        .regex(/[a-z]/, t("passwordReqLower"))
        .regex(/[0-9]/, t("passwordReqDigit"))
        .regex(/[^A-Za-z0-9]/, t("passwordReqSpecial")),
      confirmPassword: z.string().min(1, t("confirmNewPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("confirmNewPasswordMismatch"),
      path: ["confirmPassword"],
    });
}

export const updatePasswordSchema = createUpdatePasswordSchema();
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export function createUpdateProfileSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    name: z
      .string()
      .min(1, t("nameRequired"))
      .min(2, t("nameTooShort")),
    email: z
      .string()
      .min(1, t("emailRequired"))
      .and(z.email(t("emailInvalid"))),
    image: z.string().optional(),
  });
}

export const updateProfileSchema = createUpdateProfileSchema();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export function createForgotPasswordSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .and(z.email(t("emailInvalid"))),
  });
}

export const forgotPasswordSchema = createForgotPasswordSchema();
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function createResetPasswordSchema(t: SchemaTranslator = defaultTranslator) {
  return z
    .object({
      password: z
        .string()
        .min(8, t("passwordMin"))
        .regex(/[A-Z]/, t("passwordReqUpper"))
        .regex(/[a-z]/, t("passwordReqLower"))
        .regex(/[0-9]/, t("passwordReqDigit"))
        .regex(/[^A-Za-z0-9]/, t("passwordReqSpecial")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPasswordMismatch"),
      path: ["confirmPassword"],
    });
}

export const resetPasswordSchema = createResetPasswordSchema();
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function createResetPasswordActionSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    token: z.string().min(1, t("tokenRequired")),
    newPassword: z
      .string()
      .min(8, t("newPasswordMin"))
      .regex(/[A-Z]/, t("passwordReqUpper"))
      .regex(/[a-z]/, t("passwordReqLower"))
      .regex(/[0-9]/, t("passwordReqDigit"))
      .regex(/[^A-Za-z0-9]/, t("passwordReqSpecial")),
  });
}

export const resetPasswordActionSchema = createResetPasswordActionSchema();
export type ResetPasswordActionInput = z.infer<typeof resetPasswordActionSchema>;
