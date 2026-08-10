import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Login tests (RFC-006, F3/F4, AC-LOGIN-1/2, AC-AUTH-1, SEC-1, SEC-8).
 *
 * Split into:
 * - Pure behavioral tests against real loginSchema and authConfig
 * - Source-structure tests on actions/auth.ts, auth.ts, LoginForm.tsx
 */

import { loginSchema } from "../lib/zod";
import { authConfig } from "../auth.config";

let passed = 0;
let failed = 0;

const tests: { name: string; fn: () => void | Promise<void> }[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

const actionsPath = path.join(process.cwd(), "actions/auth.ts");
const actionsSrc = fs.readFileSync(actionsPath, "utf-8");

const authPath = path.join(process.cwd(), "auth.ts");
const authSrc = fs.readFileSync(authPath, "utf-8");

const loginFormPath = path.join(process.cwd(), "components/LoginForm.tsx");
const loginFormSrc = fs.readFileSync(loginFormPath, "utf-8");

// --- loginSchema validation (AC-AUTH-3, SEC-8) ---

test("empty email → fail with 'Email wajib diisi'", () => {
  const r = loginSchema.safeParse({ email: "", password: "Rahasia123!" });
  assert.equal(r.success, false);
  if (!r.success) {
    assert.equal(r.error.issues[0].message, "Email wajib diisi");
  }
});

test("invalid email → fail with 'Format email tidak valid…'", () => {
  const r = loginSchema.safeParse({ email: "bukan-email", password: "Rahasia123!" });
  assert.equal(r.success, false);
  if (!r.success) {
    assert.equal(
      r.error.issues[0].message,
      "Format email tidak valid. Contoh: kamu@email.com"
    );
  }
});

test("empty password → fail with 'Password wajib diisi'", () => {
  const r = loginSchema.safeParse({ email: "kamu@email.com", password: "" });
  assert.equal(r.success, false);
  if (!r.success) {
    assert.equal(r.error.issues[0].message, "Password wajib diisi");
  }
});

test("password < 8 chars → fail with 'Password Minimal 8 Karakter…'", () => {
  const r = loginSchema.safeParse({ email: "kamu@email.com", password: "Short1!" });
  assert.equal(r.success, false);
  if (!r.success) {
    assert.ok(
      r.error.issues[0].message.startsWith("Password Minimal 8 Karakter"),
      "should enforce an 8-char minimum with an id-ID message"
    );
  }
});

test("valid email + password → pass (AC-LOGIN-1 precondition)", () => {
  const r = loginSchema.safeParse({ email: "kamu@email.com", password: "Rahasia123!" });
  assert.equal(r.success, true);
});

test("valid email + exactly-8 password → pass", () => {
  const r = loginSchema.safeParse({ email: "kamu@email.com", password: "Abcd1234" });
  assert.equal(r.success, true);
});

test("valid input → data passthrough (no mutation)", () => {
  const r = loginSchema.safeParse({ email: "kamu@email.com", password: "Rahasia123!" });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.email, "kamu@email.com");
    assert.equal(r.data.password, "Rahasia123!");
  }
});

// --- authConfig behavior (AC-AUTH-1, SEC-1) ---

test("pages.signIn = '/login'", () => {
  assert.equal(authConfig.pages.signIn, "/login");
});

const jwtCb = authConfig.callbacks.jwt as unknown as (params: {
  token: Record<string, unknown>;
  user: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

test("jwt callback copies id to token", async () => {
  const out = await jwtCb({ token: {}, user: { id: "u1" } });
  assert.equal(out.id, "u1");
});

test("jwt callback defaults role to CUSTOMER (AC-AUTH-1)", async () => {
  const out = await jwtCb({ token: {}, user: { id: "u2" } });
  assert.equal(out.role, "CUSTOMER");
});

test("jwt callback keeps ADMIN role on token (AC-AUTH-1)", async () => {
  const out = await jwtCb({ token: {}, user: { id: "u3", role: "ADMIN" } });
  assert.equal(out.role, "ADMIN");
});

test("jwt callback copies image to token", async () => {
  const out = await jwtCb({ token: {}, user: { id: "u4", image: "https://x/avatar.png" } });
  assert.equal(out.image, "https://x/avatar.png");
});

const sessionCb = authConfig.callbacks.session as unknown as (params: {
  session: { user?: Record<string, unknown> };
  token: Record<string, unknown>;
}) => Promise<{ user?: Record<string, unknown> }>;

test("session callback copies id/role/image from token", async () => {
  const out = await sessionCb({
    session: { user: {} },
    token: { id: "u1", role: "ADMIN", image: null },
  });
  const user = out.user;
  assert.ok(user, "session.user should exist");
  if (user) {
    assert.equal(user.id, "u1");
    assert.equal(user.role, "ADMIN");
    assert.equal(user.image, null);
  }
});

// --- actions/auth.ts authenticate (AC-LOGIN-1/2) ---

test("authenticate is a server action ('use server')", () => {
  assert.ok(actionsSrc.includes('"use server"'), "should be a server action");
});

test("action validates via loginSchema.safeParse (SEC-8)", () => {
  assert.ok(
    actionsSrc.includes("loginSchema.safeParse({ email, password })"),
    "should re-validate raw input server-side",
  );
});

test("success redirects by role: ADMIN → /admin, customer → /dashboard (AC-LOGIN-1)", () => {
  assert.ok(
    actionsSrc.includes('role === "ADMIN" ? "/admin" : "/dashboard"'),
    "should route ADMIN to /admin and customer to /dashboard",
  );
});

test("invalid credentials → id-ID error (AC-LOGIN-2)", () => {
  assert.ok(
    actionsSrc.includes("Email atau password yang Anda masukkan salah."),
    'should return id-ID "Email atau password yang Anda masukkan salah." on failure',
  );
});

test("signIn called with credentials + redirect:false", () => {
  assert.ok(
    actionsSrc.includes('signIn("credentials", {') &&
      actionsSrc.includes("redirect: false"),
    "should call NextAuth signIn with credentials and no redirect",
  );
});

test("returns typed LoginResult union (success/redirectTo | error)", () => {
  assert.ok(
    actionsSrc.includes("{ success: true; redirectTo: string }"),
    "should type success as { success: true; redirectTo: string }",
  );
  assert.ok(
    actionsSrc.includes("{ success: false; error: string }"),
    "should type failure as { success: false; error: string }",
  );
});

test("no client-supplied userId — auth state not controllable by input", () => {
  assert.ok(
    !actionsSrc.includes('formData.get("userId")'),
    "must never read userId from client input",
  );
  assert.ok(
    !actionsSrc.includes("userId"),
    "userId must not appear anywhere in the auth action",
  );
});

// --- auth.ts Credentials authorize (SEC-1, AC-AUTH-2) ---

test("authorize guards with loginSchema.safeParse(credentials)", () => {
  assert.ok(
    authSrc.includes("loginSchema.safeParse(credentials)"),
    "should validate credentials before querying",
  );
});

test("missing user or passwordHash → return null (AC-AUTH-2)", () => {
  assert.ok(
    authSrc.includes("!user.passwordHash"),
    "OAuth-only accounts (null hash) must not authenticate via Credentials",
  );
});

test("compares password via bcrypt.compare", () => {
  assert.ok(
    authSrc.includes("bcrypt.compare("),
    "should verify password against User.passwordHash",
  );
});

test("bcrypt mismatch → return null (AC-LOGIN-2: no session on bad creds)", () => {
  assert.ok(
    authSrc.includes("if (!isPasswordValid) {") && authSrc.includes("return null;"),
    "should reject invalid password without issuing a session",
  );
});

test("successful authorize returns role (AC-AUTH-1)", () => {
  assert.ok(
    authSrc.includes("role: user.role"),
    "should carry role onto the returned user for the JWT callback",
  );
});

test("Credentials + Google + Facebook providers, JWT session (TECH-4)", () => {
  assert.ok(authSrc.includes('providers/credentials') || authSrc.includes('("credentials")'));
  assert.ok(
    authSrc.includes('from "next-auth/providers/google"') &&
      authSrc.includes('from "next-auth/providers/facebook"'),
    "should register Google and Facebook providers",
  );
  assert.ok(
    authSrc.includes('session: { strategy: "jwt" }'),
    "should use JWT session strategy",
  );
});

// --- components/LoginForm.tsx flow (AC-LOGIN-1/2 UI) ---

test("form submits via login(undefined, formData)", () => {
  assert.ok(
    loginFormSrc.includes("login(undefined, formData)"),
    "should call the login server action",
  );
});

test("success → router.replace(result.redirectTo) (AC-LOGIN-1)", () => {
  assert.ok(
    loginFormSrc.includes("router.replace(result.redirectTo)"),
    "should redirect to the action-provided destination",
  );
});

test("failure → setServerError(result.error) (AC-LOGIN-2)", () => {
  assert.ok(
    loginFormSrc.includes("setServerError(result.error)"),
    "should show the action error to the user",
  );
});

// --- Summary ---
async function main() {
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✓ ${t.name}`);
      passed++;
    } catch (e: unknown) {
      console.error(`  ✗ ${t.name}`);
      console.error(`    ${(e as Error).message}`);
      failed++;
    }
  }
  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();