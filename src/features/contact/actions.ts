"use server";

import { headers } from "next/headers";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { checkRateLimit } from "@/lib/ratelimit";
import { getTranslations } from "next-intl/server";
import { buildContactSchema } from "@/features/contact/schemas";

/**
 * Sends a contact-form message via Resend, rate-limited per IP.
 */
export async function sendContactAction(rawInput: unknown) {
  const t = await getTranslations("validation");
  const validated = buildContactSchema(t).safeParse(rawInput);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { success } = await checkRateLimit(`contact:${ip}`);
  if (!success) {
    return { success: false, error: t("rateLimitContact") };
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
      return { success: false, error: t("contactSendFailed") };
    }

    return { success: true };
  } catch (error) {
    console.error("Contact email error:", error);
    return { success: false, error: t("contactServerError") };
  }
}
