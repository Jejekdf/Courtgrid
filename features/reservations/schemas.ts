import { z } from "zod";
import { validateBookingTime } from "@/lib/timezone";
import { defaultTranslator, type SchemaTranslator } from "@/lib/zod";

export function buildReservationSchema(t: SchemaTranslator = defaultTranslator) {
  return z
    .object({
      courtId: z.string().min(1, t("courtRequired")),
      dateStr: z.string().min(1, t("dateRequired")),
      startTime: z.string().regex(/^\d{2}:00$/, t("startTimeInvalid")),
      endTime: z.string().regex(/^\d{2}:00$/, t("endTimeInvalid")),
      totalPrice: z.number().positive(t("totalPricePositive")),
      voucherCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const tzError = validateBookingTime(data.dateStr, data.startTime, t);
      if (tzError) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: tzError });
      }
      if (data.endTime <= data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("endTimeAfterStart"),
        });
      }
    });
}

const defaultReservationSchema = buildReservationSchema();

// Support both createReservationSchema(t) factory and createReservationSchema.safeParse()
export const createReservationSchema = Object.assign(
  (t?: SchemaTranslator) => (t ? buildReservationSchema(t) : defaultReservationSchema),
  defaultReservationSchema
);

export type CreateReservationInput = z.infer<typeof defaultReservationSchema>;

export function createCancelReservationSchema(t: SchemaTranslator = defaultTranslator) {
  return z.object({
    reservationId: z.string().min(1, t("reservationIdRequired")),
  });
}

export const cancelReservationSchema = createCancelReservationSchema();
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
