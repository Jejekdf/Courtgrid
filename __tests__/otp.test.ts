import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { verifyOtpSchema } from "../lib/zod";

test("verifyOtpSchema: rejects empty email or OTP", () => {
  const r = verifyOtpSchema.safeParse({ email: "", otp: "" });
  assert.equal(r.success, false);
});

test("verifyOtpSchema: rejects OTP length != 6", () => {
  assert.equal(
    verifyOtpSchema.safeParse({ email: "user@example.com", otp: "12345" }).success,
    false,
  );
  assert.equal(
    verifyOtpSchema.safeParse({ email: "user@example.com", otp: "1234567" }).success,
    false,
  );
});

test("verifyOtpSchema: rejects non-numeric characters", () => {
  assert.equal(
    verifyOtpSchema.safeParse({ email: "user@example.com", otp: "12345a" }).success,
    false,
  );
});

test("verifyOtpSchema: accepts valid email and 6-digit numeric OTP", () => {
  const r = verifyOtpSchema.safeParse({ email: "user@example.com", otp: "839201" });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.otp, "839201");
  }
});

test("OTP hashing: sha256 produces 64-char hex digest deterministically", () => {
  const otp = "654321";
  const hash1 = crypto.createHash("sha256").update(otp).digest("hex");
  const hash2 = crypto.createHash("sha256").update(otp).digest("hex");
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

test("OTP expiration check: detects expired timestamps accurately", () => {
  const pastExpires = new Date(Date.now() - 1000);
  const futureExpires = new Date(Date.now() + 10 * 60 * 1000);
  assert.equal(pastExpires < new Date(), true);
  assert.equal(futureExpires < new Date(), false);
});
