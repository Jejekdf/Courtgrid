import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Single owner rule for ghost-booking auto-cancel.
 *
 * Cancels PENDING reservations where:
 *   createdAt < now - auto_cancel_timeout AND stripe_session_id IS NULL
 *
 * A reservation with a live stripe_session_id is never released here —
 * only Stripe session expiry (~24h) or explicit admin action handles it.
 *
 * Idempotent: safe to call concurrently with the webhook.
 * The PENDING-only scope prevents double-handling with a just-completed payment.
 */
export async function autoCancelGhostBookings(): Promise<void> {
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  const timeoutMinutes = setting?.autoCancelTimeout ?? 15;

  const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

  await prisma.reservation.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
      stripeSessionId: null,
    },
    data: {
      status: "CANCELED",
    },
  });
}
