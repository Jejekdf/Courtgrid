import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .and(z.email("Format email tidak valid. Contoh: kamu@email.com")),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password Minimal 8 Karakter. Tambahkan kombinasi huruf besar, kecil, angka, dan simbol."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nama: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .min(2, "Nama terlalu pendek. Minimal 2 karakter."),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .and(z.email("Format email tidak valid. Contoh: kamu@email.com")),
    no_hp: z
      .string()
      .min(1, "Nomor HP wajib diisi")
      .regex(
        /^[0-9+\-\s]{10,15}$/,
        "Format nomor HP tidak valid. Harus 10-15 digit angka serta bisa diawali +62."
      ),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Agar lebih aman, tambahkan minimal 1 huruf besar (A-Z).")
      .regex(/[a-z]/, "Tambahkan minimal 1 huruf kecil (a-z).")
      .regex(/[0-9]/, "Tambahkan minimal 1 angka (0-9).")
      .regex(
        /[^A-Za-z0-9]/,
        "Tambahkan minimal 1 karakter spesial (!@#$%^&*) untuk keamanan ekstra."
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok. Cek kembali password yang kamu masukkan.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
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
    confirmPassword: z.string().min(1, "Konfirmasi password baru wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok. Cek kembali password yang kamu masukkan.",
    path: ["confirmPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .min(2, "Nama terlalu pendek. Minimal 2 karakter."),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .and(z.email("Format email tidak valid. Contoh: kamu@email.com")),
  image: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .and(z.email("Format email tidak valid. Contoh: kamu@email.com")),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Tambahkan minimal 1 huruf besar (A-Z).")
      .regex(/[a-z]/, "Tambahkan minimal 1 huruf kecil (a-z).")
      .regex(/[0-9]/, "Tambahkan minimal 1 angka (0-9).")
      .regex(
        /[^A-Za-z0-9]/,
        "Tambahkan minimal 1 karakter spesial (!@#$%^&*) untuk keamanan ekstra."
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok. Cek kembali password yang kamu masukkan.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
