import { z } from "zod";

export const scanTicketSchema = z.object({
  reservationId: z.string().min(1, "ID Tiket wajib diisi."),
});

export const createCourtSchema = z.object({
  name: z
    .string()
    .min(2, "Nama lapangan terlalu pendek. Minimal 2 karakter.")
    .max(50, "Nama lapangan terlalu panjang. Maksimal 50 karakter."),
  type: z.enum(["FUTSAL", "BADMINTON"]),
  pricePerHour: z
    .number()
    .positive("Harga per jam harus lebih dari 0.")
    .int("Harga per jam harus bilangan bulat.")
    .max(999999999, "Harga per jam terlalu besar."),
  isActive: z.boolean().default(true),
});
