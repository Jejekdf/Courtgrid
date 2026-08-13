import assert from "node:assert/strict";
import { jakartaDayBounds, jakartaMonthBounds, getJakartaNow } from "../lib/timezone";

// DM-2 / RFC-018: admin day & month report windows are Asia/Jakarta,
// independent of the server's local timezone.

let passed = 0;
let failed = 0;

const tests: { name: string; fn: () => void | Promise<void> }[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

test("jakartaDayBounds maps a WIB calendar day to UTC instants", () => {
  // 2026-08-11 00:00 WIB == 2026-08-10 17:00 UTC
  const { start, end } = jakartaDayBounds("2026-08-11");
  assert.equal(start.toISOString(), "2026-08-10T17:00:00.000Z");
  assert.equal(end.toISOString(), "2026-08-11T17:00:00.000Z");
  assert.equal(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000);
});

test("jakartaDayBounds keeps whole hours, no server-TZ shift", () => {
  const { start } = jakartaDayBounds("2026-01-01");
  assert.equal(start.toISOString(), "2025-12-31T17:00:00.000Z");
});

test("jakartaMonthBounds spans first-of-month 00:00 WIB to next-month 00:00 WIB", () => {
  const { start, end } = jakartaMonthBounds("2026-02");
  assert.equal(start.toISOString(), "2026-01-31T17:00:00.000Z");
  assert.equal(end.toISOString(), "2026-02-28T17:00:00.000Z");
});

test("getJakartaNow returns YYYY-MM-DD with hour 0-23 (deterministic math)", () => {
  const now = getJakartaNow();
  assert.match(now.dateStr, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(now.hour >= 0 && now.hour <= 23);
});

(async () => {
  for (const t of tests) {
    try {
      await t.fn();
      passed += 1;
      console.log(`  ✓ ${t.name}`);
    } catch (error) {
      failed += 1;
      console.error(`  ✗ ${t.name}`);
      console.error(error);
    }
  }
  console.log(`\n${passed} tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();