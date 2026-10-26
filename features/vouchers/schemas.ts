import { z } from "zod";
import { type SchemaTranslator, defaultTranslator } from "@/lib/zod";

export function buildVoucherSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    code: z
      .string()
      .min(3, t("voucherCodeMin"))
      .max(20, t("voucherCodeMax"))
      .regex(/^[A-Z0-9_-]+$/, t("voucherCodePattern"))
      .transform((v) => v.trim().toUpperCase()),
    discountPct: z
      .coerce
      .number({ message: t("voucherDiscountNumber") })
      .int(t("voucherDiscountInt"))
      .min(1, t("voucherDiscountMin"))
      .max(100, t("voucherDiscountMax")),
    maxDiscount: z
      .union([z.coerce.number().int().positive(t("voucherMaxDiscountPositive")), z.literal(""), z.null()])
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional(),
    minSpend: z.coerce.number().int().min(0, t("voucherMinSpendNonNegative")).default(0),
    expiresAt: z.coerce.date({ message: t("voucherExpiryRequired") }),
    maxUses: z.coerce.number().int().min(1, t("voucherQuotaMin")).max(100, t("voucherQuotaMax")).default(1),
    description: z.string().max(200, t("voucherDescMax")).nullable().optional()
      .transform((v) => (v && v.trim() === "" ? null : v?.trim() ?? null)),
    isActive: z.coerce.boolean().default(true),
  });
}

export const voucherSchema = buildVoucherSchema();

export type VoucherInput = z.infer<typeof voucherSchema>;

export function validateVoucherExpiry(
  date: Date,
  t: SchemaTranslator = defaultTranslator
): string | null {
  if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
    return t("voucherExpiryPast");
  }
  return null;
}
