import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing. Please set it in your .env file.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "CourtGrid <onboarding@resend.dev>";
