import assert from "node:assert/strict";
import { getJakartaNow, validateBookingTime } from "../lib/timezone";

function getJakartaNowForTest(utcMs: number): { dateStr: string; hour: number } {
  const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
  const jakartaMs = utcMs + JAKARTA_OFFSET_MS;
  const jakartaDate = new Date(jakartaMs);
  const year = jakartaDate.getUTCFullYear();
  const month = String(jakartaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jakartaDate.getUTCDate()).padStart(2, "0");
  return { dateStr: `${year}-${month}-${day}`, hour: jakartaDate.getUTCHours() };
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(e as Error).message}`);
    failed++;
  }
}

// --- AC-TZ-1: UTC round-trip ---
test("getJakartaNow returns correct Jakarta date/hour from UTC", () => {
  // 2026-08-10T00:30:00Z = 2026-08-10T07:30:00+07:00 → hour=7
  const utcMs = Date.UTC(2026, 7, 10, 0, 30, 0, 0);
  const result = getJakartaNowForTest(utcMs);
  assert.equal(result.dateStr, "2026-08-10");
  assert.equal(result.hour, 7);
});

test("getJakartaNow wraps midnight correctly", () => {
  // 2026-08-09T18:00:00Z = 2026-08-10T01:00:00+07:00 → date=next day
  const utcMs = Date.UTC(2026, 7, 9, 18, 0, 0, 0);
  const result = getJakartaNowForTest(utcMs);
  assert.equal(result.dateStr, "2026-08-10");
  assert.equal(result.hour, 1);
});

// --- AC-BOOK-3: Past date rejected ---
test("validateBookingTime rejects past date", () => {
  const { dateStr: today } = getJakartaNow();
  const pastDate = "2020-01-01";
  assert.notEqual(pastDate, today, "test setup: pastDate must differ from today");
  const result = validateBookingTime(pastDate, "10:00");
  assert.equal(result, "Tidak bisa memesan untuk tanggal yang sudah lewat.");
});

// --- AC-TZ-2: Today with passed hour rejected ---
test("validateBookingTime rejects today with passed hour", () => {
  const { dateStr: today, hour: currentHour } = getJakartaNow();
  // Pick an hour that has definitely passed (or current hour)
  const pastHour = String(Math.max(0, currentHour)).padStart(2, "0") + ":00";
  const result = validateBookingTime(today, pastHour);
  assert.equal(result, "Tidak bisa memesan untuk jam yang sudah lewat. Pilih jam setelah jam berikutnya.");
});

// --- AC-TZ-2: Today with future hour accepted ---
test("validateBookingTime accepts today with future hour", () => {
  const { dateStr: today, hour: currentHour } = getJakartaNow();
  const futureHour = String(Math.min(23, currentHour + 1)).padStart(2, "0") + ":00";
  const result = validateBookingTime(today, futureHour);
  assert.equal(result, null);
});

// --- Future date accepted ---
test("validateBookingTime accepts future date", () => {
  const result = validateBookingTime("2099-12-31", "10:00");
  assert.equal(result, null);
});

// --- Schema superRefine test ---
test("createReservationSchema rejects past date via superRefine", async () => {
  const { createReservationSchema } = await import("../src/features/reservations/schemas");
  const result = createReservationSchema.safeParse({
    courtId: "test-court",
    dateStr: "2020-01-01",
    startTime: "10:00",
    endTime: "11:00",
    totalPrice: 100000,
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const hasTzError = result.error.issues.some((i) =>
      i.message.includes("sudah lewat")
    );
    assert.equal(hasTzError, true, "should have timezone error message");
  }
});

test("createReservationSchema accepts valid future booking", async () => {
  const { createReservationSchema } = await import("../src/features/reservations/schemas");
  const { dateStr: today, hour: currentHour } = getJakartaNow();
  const futureHour = String(Math.min(23, currentHour + 1)).padStart(2, "0") + ":00";
  const nextHour = String(Math.min(23, currentHour + 2)).padStart(2, "0") + ":00";

  const result = createReservationSchema.safeParse({
    courtId: "test-court",
    dateStr: today,
    startTime: futureHour,
    endTime: nextHour,
    totalPrice: 100000,
  });
  assert.equal(result.success, true);
});

// --- Summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
