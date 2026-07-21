import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email tidak boleh kosong")
    .email("Format email tidak valid (harus mengandung @)"),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong")
    .min(8, "Password minimal 8 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nama: z
      .string()
      .min(1, "Nama lengkap tidak boleh kosong")
      .min(2, "Nama minimal 2 karakter"),
    email: z
      .string()
      .min(1, "Email tidak boleh kosong")
      .email("Format email tidak valid (harus mengandung @)"),
    no_hp: z
      .string()
      .min(1, "Nomor HP tidak boleh kosong")
      .regex(
        /^[0-9+\-\s]{10,15}$/,
        "Format nomor HP tidak valid (10-15 digit angka)"
      ),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar (A-Z)")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil (a-z)")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka (0-9)")
      .regex(
        /[^A-Za-z0-9]/,
        "Password harus mengandung minimal 1 karakter spesial (!@#$%^&*)"
      ),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok dengan password yang dimasukkan",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
