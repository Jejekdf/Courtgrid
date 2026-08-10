/**
 * RFC-011 / DM-4: Pure helpers for strict double-booking validation.
 *
 * No server-only imports — testable via plain node.
 */

/**
 * Statuses considered "active" when checking double-booking overlap (DM-4).
 * PENDING  — unpaid slot held for checkout
 * DP_PAID  — 50% DP paid; reservation in use
 */
export const ACTIVE_BOOKING_STATUSES = ["PENDING", "DP_PAID"] as const;

/**
 * Check whether two half-open intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 *
 * Half-open semantics: two adjacent slots where aEnd === bStart are NOT overlapping.
 * This is the correct predicate for hourly time slots.
 */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Compute deposit amount (PAY-1): ceil(totalPrice / 2).
 * Pure math; no DB.
 */
export function computeDeposit(totalPrice: number): number {
  return Math.ceil(totalPrice / 2);
}
