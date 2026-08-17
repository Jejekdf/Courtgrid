import { z } from "zod";
import { defaultTranslator, type SchemaTranslator } from "@/lib/zod";

const defaultMessages: Record<string, string> = {
  contactNameTooShort: "Nama terlalu pendek. Minimal 2 karakter.",
  contactNameTooLong: "Nama terlalu panjang. Maksimal 50 karakter.",
  emailRequired: "Email wajib diisi",
  emailInvalid: "Format email tidak valid. Contoh: kamu@email.com",
  contactMessageTooShort: "Pesan terlalu pendek. Minimal 10 karakter agar tim kami bisa memahami kendala Anda dengan jelas.",
  contactMessageTooLong: "Pesan terlalu panjang. Maksimal 1000 karakter.",
};

export function buildContactSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    name: z.string().min(2, t("contactNameTooShort") || defaultMessages.contactNameTooShort).max(50, t("contactNameTooLong") || defaultMessages.contactNameTooLong),
    email: z.string().min(1, t("emailRequired") || defaultMessages.emailRequired).and(z.email(t("emailInvalid") || defaultMessages.emailInvalid)),
    message: z.string().min(10, t("contactMessageTooShort") || defaultMessages.contactMessageTooShort).max(1000, t("contactMessageTooLong") || defaultMessages.contactMessageTooLong),
  });
}

const defaultContactSchema = buildContactSchema();
export const contactSchema = Object.assign(
  (t?: SchemaTranslator) => (t ? buildContactSchema(t) : defaultContactSchema),
  defaultContactSchema
);

export type ContactInput = z.infer<typeof defaultContactSchema>;
