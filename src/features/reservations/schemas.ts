import { z } from "zod";
import { validateBookingTime } from "@/lib/timezone";

export const createReservationSchema = z.object({
  courtId: z.string().min(1, "Lapangan wajib dipilih."),
  dateStr: z.string().min(1, "Tanggal wajib diisi."),
  startTime: z.string().regex(/^\d{2}:00$/, "Format waktu mulai tidak valid. Contoh: 14:00"),
  endTime: z.string().regex(/^\d{2}:00$/, "Format waktu selesai tidak valid. Contoh: 15:00"),
  totalPrice: z.number().positive("Total harga harus lebih dari 0."),
}).superRefine((data, ctx) => {
  const tzError = validateBookingTime(data.dateStr, data.startTime);
  if (tzError) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: tzError });
  }
  if (data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Waktu selesai harus lebih besar dari waktu mulai.",
    });
  }
});

export const cancelReservationSchema = z.object({
  reservationId: z.string().min(1, "ID Reservasi wajib diisi."),
});
