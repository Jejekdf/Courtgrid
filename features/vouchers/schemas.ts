import { z } from "zod";

export const voucherSchema = z.object({
  code: z
    .string()
    .min(3, "Kode minimal 3 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .regex(/^[A-Z0-9_-]+$/, "Kode hanya boleh huruf kapital, angka, dash dan underscore")
    .transform((v) => v.trim().toUpperCase()),
  discountPct: z
    .coerce
    .number({ message: "Diskon wajib angka" })
    .int("Diskon harus bulat")
    .min(1, "Diskon minimal 1%")
    .max(100, "Diskon maksimal 100%"),
  maxDiscount: z
    .union([z.coerce.number().int().positive("Maks diskon harus positif"), z.literal(""), z.null()])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  minSpend: z.coerce.number().int().min(0, "Min belanja tidak boleh negatif").default(0),
  expiresAt: z.coerce.date({ message: "Tanggal kedaluwarsa wajib diisi" }),
  maxUses: z.coerce.number().int().min(1, "Kuota minimal 1").max(100, "Kuota maksimal 100").default(1),
  description: z.string().max(200, "Deskripsi maksimal 200 karakter").nullable().optional()
    .transform((v) => (v && v.trim() === "" ? null : v?.trim() ?? null)),
  isActive: z.coerce.boolean().default(true),
});

export type VoucherInput = z.infer<typeof voucherSchema>;

export function validateVoucherExpiry(date: Date): string | null {
  if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
    return "Tanggal kedaluwarsa tidak boleh di masa lalu";
  }
  return null;
}
