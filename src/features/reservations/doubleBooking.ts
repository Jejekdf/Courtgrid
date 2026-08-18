/**
 * Pure helpers for double-booking validation.
 *
 * No server-only imports — testable via plain node.
 */

/**
 * Statuses treated as "active" when checking double-booking overlap.
 * PENDING  — unpaid slot held for checkout
 * DP_PAID  — 50% DP paid; reservation in use
 */
export const ACTIVE_BOOKING_STATUSES = ["PENDING", "DP_PAID"] as const;

/**
 * Whether two half-open intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 *
 * Half-open semantics: two adjacent slots where aEnd === bStart are NOT
 * overlapping — the correct predicate for hourly time slots.
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
 * Down payment = ceil(totalPrice * dpPercentage / 100), dpPercentage default 50.
 * Pure math; no DB.
 */
export function computeDeposit(totalPrice: number, dpPercentage: number = 50): number {
  return Math.ceil((totalPrice * dpPercentage) / 100);
}
