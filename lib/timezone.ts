const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Returns the current date string (YYYY-MM-DD) and hour (0-23) in Asia/Jakarta timezone.
 * Asia/Jakarta is fixed UTC+7 (no DST) — no external dependency needed.
 */
export function getJakartaNow(): { dateStr: string; hour: number } {
  const nowUtc = Date.now();
  const jakartaMs = nowUtc + JAKARTA_OFFSET_MS;
  const jakartaDate = new Date(jakartaMs);

  const year = jakartaDate.getUTCFullYear();
  const month = String(jakartaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jakartaDate.getUTCDate()).padStart(2, "0");
  const hour = jakartaDate.getUTCHours();

  return { dateStr: `${year}-${month}-${day}`, hour };
}

/**
 * Jakarta day bounds (DM-2, RFC-018). Returns the UTC instants for
 * [00:00 WIB, 00:00 WIB next day) of the given YYYY-MM-DD date.
 * Used for daily report/filter windows.
 */
export function jakartaDayBounds(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d) - JAKARTA_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Jakarta month bounds (DM-2, RFC-018). Returns the UTC instants for
 * [00:00 WIB first-of-month, 00:00 WIB first-of-next-month).
 */
export function jakartaMonthBounds(dateStr: string): { start: Date; end: Date } {
  const [y, m] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1) - JAKARTA_OFFSET_MS);
  const end = new Date(Date.UTC(y, m, 1) - JAKARTA_OFFSET_MS);
  return { start, end };
}

import type { SchemaTranslator } from "@/lib/zod";

/**
 * Validates that a booking date+startTime is not in the past (Asia/Jakarta).
 * DM-2, DM-3: reject date < today; reject date === today with startTime <= current hour.
 * Returns null if valid, or a localized / id-ID error message.
 */
export function validateBookingTime(
  dateStr: string,
  startTime: string,
  t?: SchemaTranslator
): string | null {
  const { dateStr: todayStr, hour: currentHour } = getJakartaNow();
  const startHour = parseInt(startTime.split(":")[0], 10);

  if (dateStr < todayStr) {
    return t ? t("pastDate") : "Tidak bisa memesan untuk tanggal yang sudah lewat.";
  }

  if (dateStr === todayStr && startHour <= currentHour) {
    return t
      ? t("pastHour")
      : "Tidak bisa memesan untuk jam yang sudah lewat. Pilih jam setelah jam berikutnya.";
  }

  return null;
}

/**
 * Format slot hours for display (Kategori A — WIB-as-UTC convention).
 *
 * Slot hours are stored as UTC timestamps whose UTC wall-clock hour EQUALS
 * the booked WIB hour (18:00 WIB → 18:00Z, NOT 11:00Z). This is a deliberate
 * convention — see getCourtAvailabilityDAL's getUTCHours() indexing.
 * Display MUST use timeZone "UTC". Do NOT use "Asia/Jakarta" (shift +7 → "01:00")
 * and do NOT omit timeZone (would follow server/browser TZ).
 */
export function formatSlotHour(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
