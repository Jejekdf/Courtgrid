import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Double-booking tests (AC-BOOK-1/2/4/5).
 *
 * Split into:
 * - Pure logic tests (intervalsOverlap, computeDeposit)
 * - Source-structure tests (action file assertions)
 */

// --- Pure helpers ---

import {
  intervalsOverlap,
  computeDeposit,
  ACTIVE_BOOKING_STATUSES,
} from "../features/reservations/doubleBooking";

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

function d(h: number): Date {
  return new Date(Date.UTC(2026, 0, 1, h, 0, 0, 0));
}

// --- AC-BOOK-2: intervalsOverlap (half-open [start,end)) ---

test("exact overlap: [9,10) vs [9,10) → true", () => {
  assert.equal(intervalsOverlap(d(9), d(10), d(9), d(10)), true);
});

test("partial overlap start-inside: [8,11) vs [9,10) → true", () => {
  assert.equal(intervalsOverlap(d(8), d(11), d(9), d(10)), true);
});

test("partial overlap end-inside: [9,10) vs [8,11) → true", () => {
  assert.equal(intervalsOverlap(d(9), d(10), d(8), d(11)), true);
});

test("containment: [8,12) vs [9,10) → true", () => {
  assert.equal(intervalsOverlap(d(8), d(12), d(9), d(10)), true);
});

test("adjacent — no overlap: [9,10) vs [10,11) → false (half-open edge)", () => {
  assert.equal(intervalsOverlap(d(9), d(10), d(10), d(11)), false);
});

test("adjacent reversed — no overlap: [10,11) vs [9,10) → false", () => {
  assert.equal(intervalsOverlap(d(10), d(11), d(9), d(10)), false);
});

test("disjoint — earlier: [8,9) vs [10,11) → false", () => {
  assert.equal(intervalsOverlap(d(8), d(9), d(10), d(11)), false);
});

test("disjoint — later: [10,11) vs [8,9) → false", () => {
  assert.equal(intervalsOverlap(d(10), d(11), d(8), d(9)), false);
});

// --- computeDeposit ---

test("computeDeposit: even total → half", () => {
  assert.equal(computeDeposit(200000), 100000);
});

test("computeDeposit: odd total → ceil", () => {
  assert.equal(computeDeposit(150000), 75000);
});

test("computeDeposit: small odd → ceil", () => {
  assert.equal(computeDeposit(3), 2);
});

test("computeDeposit: 1 → 1", () => {
  assert.equal(computeDeposit(1), 1);
});

// --- ACTIVE_BOOKING_STATUSES ---

test("ACTIVE_BOOKING_STATUSES contains PENDING and DP_PAID", () => {
  assert.deepStrictEqual([...ACTIVE_BOOKING_STATUSES], ["PENDING", "DP_PAID"]);
});

// --- Source-structure tests on actions.ts ---

const actionsPath = path.join(
  process.cwd(),
  "features/reservations/actions.ts",
);
const actionsSrc = fs.readFileSync(actionsPath, "utf-8");

test("action catches P2002 and returns a friendly double-booking message (AC-BOOK-4)", () => {
  assert.ok(
    actionsSrc.includes('"P2002"'),
    'should check error.code === "P2002"',
  );
  assert.ok(
    actionsSrc.includes("doubleBookedRace"),
    'should return the double-booked race message',
  );
});

test("action uses ACTIVE_BOOKING_STATUSES from doubleBooking module (DM-4)", () => {
  assert.ok(
    actionsSrc.includes("ACTIVE_BOOKING_STATUSES"),
    "should import ACTIVE_BOOKING_STATUSES",
  );
});

test("action uses intervalsOverlap or atomic overlap query with lt/gt (DM-4)", () => {
  assert.ok(
    actionsSrc.includes("intervalsOverlap") || actionsSrc.includes("findFirst"),
    "should use atomic overlap check (findFirst inside transaction)",
  );
});

test("action uses computeDeposit for DP amount (PAY-1)", () => {
  assert.ok(
    actionsSrc.includes("computeDeposit"),
    "should import and use computeDeposit",
  );
});

test("action recompute totalPrice from pricePerHour × duration (PAY-1)", () => {
  assert.ok(
    actionsSrc.includes("court.pricePerHour"),
    "should read pricePerHour from DB court",
  );
  assert.ok(
    actionsSrc.includes("court.pricePerHour * duration"),
    "should compute totalPrice server-side",
  );
});

test("action creates Reservation(PENDING) + Payment(PENDING) in one transaction (AC-BOOK-1)", () => {
  assert.ok(
    actionsSrc.includes('$transaction(async (tx)'),
    "should use interactive $transaction",
  );
  assert.ok(
    actionsSrc.includes('status: "PENDING"'),
    'reservation status should be "PENDING"',
  );
});

test("action verifies court exists and isActive (404 explicit)", () => {
  assert.ok(
    actionsSrc.includes("courtNotFound"),
    'should return "courtNotFound" when court missing',
  );
  assert.ok(
    actionsSrc.includes("courtInactive"),
    'should return inactive message when court !isActive',
  );
});

test("action verifies auth via verifyUserSession (SEC-2)", () => {
  assert.ok(
    actionsSrc.includes("verifyUserSession"),
    "should call verifyUserSession for auth",
  );
});

test("action returns typed success/error (STYLE-3)", () => {
  assert.ok(
    actionsSrc.includes("{ success: false, error:") || actionsSrc.includes("{success: false, error:"),
    "should return typed error result",
  );
  assert.ok(
    actionsSrc.includes("{ success: true, url:") || actionsSrc.includes("{success: true, url:"),
    "should return typed success result",
  );
});

// --- Summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
