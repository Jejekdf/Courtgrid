export type GhostCandidate = {
  createdAt: Date;
  status: string;
  stripeSessionId: string | null;
};

/**
 * Pure ghost-booking auto-cancel policy.
 *
 * Mirrors the single owner rule implemented in `ghostCancel.ts`:
 * cancel a reservation only when it is PENDING, has no live Stripe session
 * (stripeSessionId === null), and was created before `now - timeout`.
 *
 * A reservation with a live stripe_session_id is NEVER released here —
 * only Stripe session expiry (~24h) or explicit admin action handles it.
 *
 * Tested as the executable spec; the SQL owner lives in ghostCancel.ts.
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