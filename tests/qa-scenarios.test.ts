import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

import { loginSchema } from "@/lib/zod";
import { validateBookingTime } from "@/lib/timezone";
import { verifyCredentialsPassword } from "@/features/auth/credentials";
import {
  ACTIVE_BOOKING_STATUSES,
  intervalsOverlap,
  computeDeposit,
} from "@/features/reservations/doubleBooking";
import { shouldAutoCancelGhost } from "@/features/reservations/ghostPolicy";
import { createReservationSchema } from "@/features/reservations/schemas";

// --- FIX-H2 helpers (Asia/Jakarta boundaries) ---
function jakartaToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}
function shiftDay(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
function jakartaHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
    10,
  );
}

// === QA-1: AC-LOGIN-1 — correct credentials → password verified (session permitted) ===
test("AC-LOGIN-1: correct credentials pass credential verification", async () => {
  const hash = await bcrypt.hash("Rahasia123!", 10);
  const ok = await verifyCredentialsPassword({ passwordHash: hash }, "Rahasia123!");
  assert.equal(ok, true);
});

// === QA-1: AC-LOGIN-2 — incorrect credentials → error, no session ===
test("AC-LOGIN-2: wrong password is rejected, no session", async () => {
  const hash = await bcrypt.hash("Rahasia123!", 10);
  assert.equal(await verifyCredentialsPassword({ passwordHash: hash }, "salah-password"), false);
  assert.equal(await verifyCredentialsPassword(null, "Rahasia123!"), false);
  // OAuth-only account (SEC-5): no passwordHash → credential login impossible
  assert.equal(await verifyCredentialsPassword({ passwordHash: null }, "Rahasia123!"), false);
});

test("AC-LOGIN-1/2: loginSchema validates input shape", () => {
  assert.equal(
    loginSchema.safeParse({ email: "user@courtgrid.com", password: "Rahasia123!" }).success,
    true,
  );
  assert.equal(
    loginSchema.safeParse({ email: "bukan-email", password: "x" }).success,
    false,
  );
});

// === QA-1: AC-BOOK-1 — valid reservation input is accepted for persistence ===
test("AC-BOOK-1: valid future booking passes createReservationSchema", () => {
  const tomorrow = shiftDay(jakartaToday(), 1);
  const valid = createReservationSchema.safeParse({
    courtId: "court-1",
    dateStr: tomorrow,
    startTime: "10:00",
    endTime: "11:00",
    totalPrice: 150000,
  });
  assert.equal(valid.success, true);
});

test("AC-BOOK-1: past-date and malformed bookings are rejected (FIX-H2, DM-7)", () => {
  const yesterday = shiftDay(jakartaToday(), -1);
  const tomorrow = shiftDay(jakartaToday(), 1);
  assert.equal(
    createReservationSchema.safeParse({
      courtId: "court-1",
      dateStr: yesterday,
      startTime: "10:00",
      endTime: "11:00",
      totalPrice: 150000,
    }).success,
    false,
  );
  // non-whole-hour slot
  assert.equal(
    createReservationSchema.safeParse({
      courtId: "court-1",
      dateStr: tomorrow,
      startTime: "10:30",
      endTime: "11:00",
      totalPrice: 150000,
    }).success,
    false,
  );
  // end <= start
  assert.equal(
    createReservationSchema.safeParse({
      courtId: "court-1",
      dateStr: tomorrow,
      startTime: "12:00",
      endTime: "11:00",
      totalPrice: 150000,
    }).success,
    false,
  );
});

test("FIX-H2: validateBookingTime rejects past date and today's elapsed hour", () => {
  const today = jakartaToday();
  const yesterday = shiftDay(today, -1);
  const tomorrow = shiftDay(today, 1);
  assert.notEqual(validateBookingTime(yesterday, "10:00"), null);
  assert.equal(validateBookingTime(tomorrow, "10:00"), null);
  // today, current hour → rejected; a later hour today → allowed
  const cur = jakartaHour();
  assert.notEqual(validateBookingTime(today, `${String(cur).padStart(2, "0")}:00`), null);
  const laterHour = Math.min(cur + 3, 23);
  assert.equal(validateBookingTime(today, `${String(laterHour).padStart(2, "0")}:00`), null);
});

// === F6 — strict double-booking (half-open intervals) ===
function dayAt(h: number, m = 0): Date {
  return new Date(Date.UTC(2026, 7, 13, h, m));
}

test("F6: overlapping slots are rejected; adjacent slots are allowed (half-open)", () => {
  // same slot
  assert.equal(intervalsOverlap(dayAt(10), dayAt(11), dayAt(10), dayAt(11)), true);
  // partial overlap
  assert.equal(intervalsOverlap(dayAt(10), dayAt(11), dayAt(10, 30), dayAt(11, 30)), true);
  // adjacent (10-11 vs 11-12) → NOT overlapping
  assert.equal(intervalsOverlap(dayAt(10), dayAt(11), dayAt(11), dayAt(12)), false);
  // disjoint
  assert.equal(intervalsOverlap(dayAt(9), dayAt(10), dayAt(11), dayAt(12)), false);
});

test("F6: active booking statuses are PENDING and DP_PAID only", () => {
  assert.deepEqual([...ACTIVE_BOOKING_STATUSES], ["PENDING", "DP_PAID"]);
});

test("PAY-1: deposit = ceil(totalPrice * dpPercentage / 100), default 50%", () => {
  assert.equal(computeDeposit(100000, 50), 50000);
  assert.equal(computeDeposit(150000, 50), 75000);
  assert.equal(computeDeposit(150001, 50), 75001);
  assert.equal(computeDeposit(100000), 50000);
});

// === FIX-H4 — ghost-booking auto-cancel policy ===
test("FIX-H4: stale PENDING without Stripe session is auto-canceled", () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const stale = new Date("2026-08-13T09:00:00.000Z");
  assert.equal(shouldAutoCancelGhost({ createdAt: stale, status: "PENDING", stripeSessionId: null }, now, 15), true);
});

test("FIX-H4: fresh bookings are never released", () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const fresh = new Date("2026-08-13T09:55:00.000Z");
  assert.equal(shouldAutoCancelGhost({ createdAt: fresh, status: "PENDING", stripeSessionId: null }, now, 15), false);
});

test("FIX-H4: live Stripe checkout is never released, even when stale", () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const stale = new Date("2026-08-13T09:00:00.000Z");
  assert.equal(shouldAutoCancelGhost({ createdAt: stale, status: "PENDING", stripeSessionId: "cs_live_abc" }, now, 15), false);
});

test("FIX-H4: non-PENDING reservations are never auto-canceled", () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const stale = new Date("2026-08-13T09:00:00.000Z");
  assert.equal(shouldAutoCancelGhost({ createdAt: stale, status: "DP_PAID", stripeSessionId: null }, now, 15), false);
});