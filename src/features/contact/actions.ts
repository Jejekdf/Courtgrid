"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { checkRateLimit } from "@/lib/ratelimit";



const contactSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek. Minimal 2 karakter.").max(50, "Nama terlalu panjang. Maksimal 50 karakter."),
  email: z.string().min(1, "Email wajib diisi").and(z.email("Format email tidak valid. Contoh: kamu@email.com")),
  message: z.string().min(10, "Pesan terlalu pendek. Minimal 10 karakter.").max(1000, "Pesan terlalu panjang. Maksimal 1000 karakter."),
});

/**
 * Server Action: Send contact message via Resend (F22).
 * Rate-limited per IP (SEC-6).
 */
export async function sendContactAction(rawInput: unknown) {
  const validated = contactSchema.safeParse(rawInput);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { success } = await checkRateLimit(`contact:${ip}`);
  if (!success) {
    return { success: false, error: "Terlalu banyak pesan yang dikirim. Silakan coba lagi dalam 15 menit." };
  }

  const { name, email, message } = validated.data;

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL || RESEND_FROM_EMAIL],
      replyTo: email,
      subject: `[Pesan Web] ${name} - CourtGrid`,
      text: `Nama: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (error) {
      console.error("Contact email error:", error);
      return { success: false, error: "Gagal mengirim pesan. Silakan coba lagi." };
    }

    return { success: true };
  } catch (error) {
    console.error("Contact email error:", error);
    return { success: false, error: "Terjadi kesalahan server saat mengirim pesan." };
  }
}
