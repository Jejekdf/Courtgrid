import "server-only";

import { prisma } from "@/lib/prisma";
import { invalidateCache, invalidateCachePattern } from "@/lib/redis";

/**
 * Cancels unpaid reservations that never reached Stripe Checkout before the
 * configured timeout elapsed. Any reservation that already has a `stripeSessionId`
 * is kept active so an in-flight checkout cannot lose its slot mid-payment.
 */
export async function autoCancelGhostBookings(): Promise<void> {
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  const timeoutMinutes = setting?.autoCancelTimeout ?? 15;

  const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

  const result = await prisma.reservation.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
      stripeSessionId: null,
    },
    data: {
      status: "CANCELED",
    },
  });

  if (result.count > 0) {
    await invalidateCache("admin:dashboard:stats");
    await invalidateCachePattern("customer:*:reservations");
    await invalidateCachePattern("public:avail:*");
  }
}

