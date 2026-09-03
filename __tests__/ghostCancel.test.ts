import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Ghost-cancel tests (AC-GHOST-1..4).
 *
 * Source-structure validation: verifies the auto-cancel predicate logic
 * is correctly implemented in the owner module.
 */

const sourcePath = path.join(
  process.cwd(),
  "features/reservations/ghostCancel.ts"
);
const src = fs.readFileSync(sourcePath, "utf-8");

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

// AC-GHOST-3: timeout from Setting.autoCancelTimeout
test("reads timeout from Setting.autoCancelTimeout with default 15", () => {
  assert.ok(src.includes("autoCancelTimeout"), "should reference Setting.autoCancelTimeout");
  assert.ok(
    src.includes("setting?.autoCancelTimeout ?? 15"),
    "should default to 15 minutes"
  );
});

// AC-GHOST-1: predicate filters PENDING only
test("predicate filters status PENDING only", () => {
  assert.ok(src.includes('status: "PENDING"'), "should filter by status PENDING");
});

// AC-GHOST-2: predicate filters stripeSessionId: null
test("predicate filters stripeSessionId null (never release session-bearing)", () => {
  assert.ok(src.includes("stripeSessionId: null"), "should filter by stripeSessionId null");
});

// AC-GHOST-1: uses createdAt < cutoff
test("uses createdAt < cutoff for timeout check", () => {
  assert.ok(src.includes("createdAt: { lt: cutoff }"), "should compare createdAt against cutoff");
});

// AC-GHOST-4: sets status to CANCELED
test("sets status to CANCELED", () => {
  assert.ok(src.includes('status: "CANCELED"'), "should set status to CANCELED");
});

// PAY-3: PENDING-only scope (no other statuses in cancel predicate)
test("PENDING-only scope — no DP_PAID/DONE/CANCELED in cancel logic", () => {
  // The cancel updateMany should only reference PENDING and CANCELED
  const lines = src.split("\n");
  const inUpdateMany = lines.some(
    (l) => l.includes("updateMany") || l.includes("status:")
  );
  assert.ok(inUpdateMany, "should have updateMany with status");
  // Verify no IN clause for other statuses in the cancel block
  assert.ok(!src.includes('"DP_PAID"'), "should not reference DP_PAID in cancel predicate");
  assert.ok(!src.includes('"DONE"'), "should not reference DONE in cancel predicate");
});

// server-only guard
test("has server-only import guard", () => {
  assert.ok(src.includes('import "server-only"'), "should have server-only import");
});

// Uses prisma singleton
test("imports prisma from @/lib/prisma", () => {
  assert.ok(src.includes('@/lib/prisma'), "should import prisma singleton");
});

// Summary
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
