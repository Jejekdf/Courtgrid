import { z } from "zod";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const courtsQuerySchema = z.object({
  courtId: z.uuid().optional(),
  date: z
    .string()
    .regex(isoDate)
    .refine((d) => {
      const dt = new Date(`${d}T00:00:00.000Z`);
      return !isNaN(dt.getTime()) && dt.toISOString().startsWith(d);
    }, "Date must be a real calendar date")
    .optional(),
  search: z.string().trim().max(50).optional(),
  type: z.enum(["FUTSAL", "BADMINTON"]).optional(),
});

export type CourtsQueryInput = z.infer<typeof courtsQuerySchema>;
