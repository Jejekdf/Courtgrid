import { z } from "zod";
import type { SchemaTranslator } from "@/lib/zod";

const defaultMessages: Record<string, string> = {
  ticketIdRequired: "ID Tiket wajib diisi.",
  courtNameRequired: "Nama lapangan wajib diisi.",
  courtNameTooShort: "Nama lapangan terlalu pendek. Minimal 2 karakter.",
  courtNameTooLong: "Nama lapangan terlalu panjang. Maksimal 60 karakter.",
  courtTypeInvalid: "Tipe lapangan tidak valid.",
  courtPricePositive: "Harga per jam harus berupa angka lebih dari 0.",
  courtPriceInt: "Harga per jam harus bilangan bulat.",
  courtPriceTooHigh: "Harga per jam terlalu besar.",
  imageUrlTooLong: "URL gambar terlalu panjang.",
};

const defaultTr: SchemaTranslator = (key) => defaultMessages[key] || key;

export function buildScanTicketSchema(t: SchemaTranslator = defaultTr) {
  return z.object({
    reservationId: z.string().min(1, t("ticketIdRequired")),
  });
}

const defaultScanTicketSchema = buildScanTicketSchema();
export const scanTicketSchema = Object.assign(
  (t?: SchemaTranslator) => (t ? buildScanTicketSchema(t) : defaultScanTicketSchema),
  defaultScanTicketSchema
);

export function buildCourtSchema(t: SchemaTranslator = defaultTr) {
  return z.object({
    name: z
      .string()
      .min(1, t("courtNameRequired"))
      .min(2, t("courtNameTooShort"))
      .max(60, t("courtNameTooLong")),
    type: z.enum(["FUTSAL", "BADMINTON"], {
      error: t("courtTypeInvalid"),
    }),
    pricePerHour: z
      .number()
      .int(t("courtPriceInt"))
      .positive(t("courtPricePositive"))
      .max(999999999, t("courtPriceTooHigh")),
    isActive: z.boolean().default(true),
    imageUrl: z.string().max(500, t("imageUrlTooLong")).optional().or(z.literal("")),
  });
}

const defaultCourtSchema = buildCourtSchema();
export const createCourtSchema = Object.assign(
  (t?: SchemaTranslator) => (t ? buildCourtSchema(t) : defaultCourtSchema),
  defaultCourtSchema
);

export type CreateCourtInput = z.infer<typeof defaultCourtSchema>;
