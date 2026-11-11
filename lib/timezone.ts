const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Returns the current date string and hour in Asia/Jakarta.
 * Jakarta is fixed at UTC+7 without daylight saving time, so arithmetic offset is exact.
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
 * Returns the UTC start and end instants for a given YYYY-MM-DD day in Asia/Jakarta.
 */
export function jakartaDayBounds(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d) - JAKARTA_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Returns the UTC start and end instants for the calendar month of a YYYY-MM-DD date in Asia/Jakarta.
 */
export function jakartaMonthBounds(dateStr: string): { start: Date; end: Date } {
  const [y, m] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1) - JAKARTA_OFFSET_MS);
  const end = new Date(Date.UTC(y, m, 1) - JAKARTA_OFFSET_MS);
  return { start, end };
}

import type { SchemaTranslator } from "@/lib/zod";

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
 * Slot hours are stored as UTC timestamps whose UTC hour matches the booked WIB hour
 * so availability queries can index directly with getUTCHours(). Always format in UTC
 * to avoid shifting the displayed hour by +7.
 */
export function formatSlotHour(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
