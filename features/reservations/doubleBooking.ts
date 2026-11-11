/**
 * Statuses that hold a court slot against new bookings.
 */
export const ACTIVE_BOOKING_STATUSES = ["PENDING", "DP_PAID"] as const;

/**
 * Half-open interval overlap check for `[aStart, aEnd)` and `[bStart, bEnd)`.
 * Adjacent hourly slots where `aEnd === bStart` do not overlap.
 */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function computeDeposit(totalPrice: number, dpPercentage: number = 50): number {
  return Math.ceil((totalPrice * dpPercentage) / 100);
}
