export type GhostCandidate = {
  createdAt: Date;
  status: string;
  stripeSessionId: string | null;
};

/**
 * Returns true when an unpaid reservation without an active Stripe checkout session
 * has exceeded the configured auto-cancel timeout. Reservations with a live
 * `stripeSessionId` are left alone until the Stripe session expires or an admin acts.
 */
export function shouldAutoCancelGhost(
  reservation: GhostCandidate,
  now: Date,
  timeoutMinutes: number,
): boolean {
  if (reservation.status !== "PENDING") {
    return false;
  }
  if (reservation.stripeSessionId !== null) {
    return false;
  }
  const cutoff = new Date(now.getTime() - timeoutMinutes * 60 * 1000);
  return reservation.createdAt < cutoff;
}