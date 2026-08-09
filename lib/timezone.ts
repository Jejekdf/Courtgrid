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
 * Validates that a booking date+startTime is not in the past (Asia/Jakarta).
 * DM-2, DM-3: reject date < today; reject date === today with startTime <= current hour.
 * Returns null if valid, or an id-ID error message.
 */
export function validateBookingTime(dateStr: string, startTime: string): string | null {
  const { dateStr: todayStr, hour: currentHour } = getJakartaNow();
  const startHour = parseInt(startTime.split(":")[0], 10);

  if (dateStr < todayStr) {
    return "Tidak bisa memesan untuk tanggal yang sudah lewat.";
  }

  if (dateStr === todayStr && startHour <= currentHour) {
    return "Tidak bisa memesan untuk jam yang sudah lewat. Pilih jam setelah jam berikutnya.";
  }

  return null;
}
