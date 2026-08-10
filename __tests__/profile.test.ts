import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Profile settings tests (RFC-008, F10, AC-PROF-1/2/3, SEC-3, SEC-5).
 *
 * Split into:
 * - Pure validation tests against the real updateProfileSchema (AC-PROF-3)
 * - Source-structure tests on actions/profile.ts (AC-PROF-1/2, SEC-3)
 * - Source-structure tests on DAL / storage / settings page
 */

import { updateProfileSchema } from "../lib/zod";

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

const actionsPath = path.join(process.cwd(), "actions/profile.ts");
const actionsSrc = fs.readFileSync(actionsPath, "utf-8");

const dalPath = path.join(process.cwd(), "src/features/auth/dal.ts");
const dalSrc = fs.readFileSync(dalPath, "utf-8");

const storagePath = path.join(process.cwd(), "lib/supabase/storage.ts");
const storageSrc = fs.readFileSync(storagePath, "utf-8");

const settingsPagePath = path.join(
  process.cwd(),
  "app/dashboard/settings/page.tsx",
);
const settingsPageSrc = fs.readFileSync(settingsPagePath, "utf-8");

// --- AC-PROF-3: updateProfileSchema validation ---

test("name empty → fail with 'Nama lengkap wajib diisi'", () => {
  const r = updateProfileSchema.safeParse({ name: "", email: "kamu@email.com" });
  assert.equal(r.success, false);
  if (!r.success) {
    assert.equal(r.error.issues[0].message, "Nama lengkap wajib diisi");
  }
});

test("name 1 char → fail with 'Nama terlalu pendek. Minimal 2 karakter.'", () => {
  const r = updateProfileSchema.safeParse({ name: "A", email: "kamu@email.com" });
  assert.equal(r.success, false);
  if (!r.success) {
    assert.equal(r.error.issues[0].message, "Nama terlalu pendek. Minimal 2 karakter.");
  }
});

test("name ≥2 chars → pass", () => {
  const r = updateProfileSchema.safeParse({ name: "Wildan", email: "kamu@email.com" });
  assert.equal(r.success, true);
});

test("invalid email → fail", () => {
  const r = updateProfileSchema.safeParse({ name: "Wildan", email: "bukan-email" });
  assert.equal(r.success, false);
});

test("valid email → pass", () => {
  const r = updateProfileSchema.safeParse({ name: "Wildan", email: "kamu@email.com" });
  assert.equal(r.success, true);
});

test("image optional → undefined passes", () => {
  const r = updateProfileSchema.safeParse({ name: "Wildan", email: "kamu@email.com" });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.image, undefined);
  }
});

test("image string → passthrough", () => {
  const url = "https://xyz.supabase.co/storage/v1/object/public/avatars/w/avatar.png";
  const r = updateProfileSchema.safeParse({
    name: "Wildan",
    email: "kamu@email.com",
    image: url,
  });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.image, url);
  }
});

// --- AC-PROF-2 (SEC-3): action derives userId from session, never input ---

test("updateProfile is a server action ('use server')", () => {
  assert.ok(actionsSrc.includes('"use server"'), "should be a server action");
});

test("no userId accepted from form input (SEC-3)", () => {
  assert.ok(
    !actionsSrc.includes('formData.get("userId")'),
    "must never read userId from client input",
  );
  assert.ok(
    !actionsSrc.includes("userId"),
    "userId identifier must not appear anywhere in actions",
  );
});

test("id derived from session.user.id", () => {
  assert.ok(
    actionsSrc.includes("session.user.id"),
    "should use session.user.id as the update target",
  );
  assert.ok(actionsSrc.includes("auth()"), "should call auth() for the session");
});

test("unauth → typed 'Unauthorized' failure (SEC-2)", () => {
  assert.ok(
    actionsSrc.includes(`error: "Unauthorized"`),
    'should return { success: false, error: "Unauthorized" }',
  );
});

// --- AC-PROF-3: validation wired into the action ---

test("action validates via updateProfileSchema.safeParse", () => {
  assert.ok(
    actionsSrc.includes("updateProfileSchema.safeParse(rawInput)"),
    "should run Zod safeParse before touching DB",
  );
  assert.ok(
    actionsSrc.includes("validation.error.issues[0].message"),
    "should surface the first Zod issue to the caller",
  );
});

test("action returns typed success/error (STYLE-3)", () => {
  assert.ok(
    actionsSrc.includes("{ success: false, error:") ||
      actionsSrc.includes("{success: false, error:"),
    "should return typed error result",
  );
  assert.ok(
    actionsSrc.includes("{ success: true, message:") ||
      actionsSrc.includes("{success: true, message:"),
    "should return typed success result",
  );
});

// --- AC-PROF-1: persistence, scoped to the session owner ---

test("persists name/email/image via updateUserProfileDAL(session.user.id, …)", () => {
  assert.ok(
    actionsSrc.includes("updateUserProfileDAL(session.user.id, {"),
    "should call DAL with session.user.id as target",
  );
  assert.ok(
    /updateUserProfileDAL\(session\.user\.id, \{\s*name,\s*email,\s*image\s*\}/.test(
      actionsSrc,
    ),
    "should pass name, email, image to the DAL",
  );
});

test("email-uniqueness guard blocks other accounts (IDOR-safe)", () => {
  assert.ok(
    actionsSrc.includes("Email sudah digunakan oleh akun lain."),
    'should return id-ID "Email sudah digunakan oleh akun lain."',
  );
  assert.ok(
    actionsSrc.includes("existingUser.id !== session.user.id"),
    "should only reject when the email belongs to a different user",
  );
});

test("id-ID success feedback reflects (AC-PROF-1)", () => {
  assert.ok(
    actionsSrc.includes("Profil akun berhasil diperbarui."),
    'should return id-ID "Profil akun berhasil diperbarui."',
  );
});

test("revalidates affected routes (header/dashboard/settings)", () => {
  assert.ok(
    actionsSrc.includes('revalidatePath("/")') &&
      actionsSrc.includes('revalidatePath("/dashboard")') &&
      actionsSrc.includes('revalidatePath("/dashboard/settings")'),
    "should revalidate all profile-affected routes",
  );
});

// --- AC-PROF-3: avatar upload guards & session-scoped path ---

test("uploadAvatarAction: file wajib / image/* / cap 2MB (id-ID)", () => {
  assert.ok(
    actionsSrc.includes("File gambar wajib diisi."),
    'should require a file ("File gambar wajib diisi.")',
  );
  assert.ok(
    actionsSrc.includes("File harus berupa gambar (JPG/PNG/WebP)."),
    'should reject non-image types ("File harus berupa gambar …")',
  );
  assert.ok(
    actionsSrc.includes("Ukuran file maksimal 2MB."),
    'should enforce the 2MB cap ("Ukuran file maksimal 2MB.")',
  );
});

test("uploadAvatarAction uploads under session.user.id (SEC-3)", () => {
  assert.ok(
    actionsSrc.includes("uploadAvatar(session.user.id, file)"),
    "should scope upload path to the session owner",
  );
});

// --- AC-PROF-1/2: DAL update is owner-scoped + image preserved ---

test("DAL updates `where: { id: userId }` (target from session)", () => {
  assert.ok(
    dalSrc.includes("where: { id: userId }"),
    "should scope the update by the caller-supplied session userId",
  );
});

test("DAL preserves existing image when not provided (no 'image: null')", () => {
  assert.ok(
    dalSrc.includes("data.image ? { image: data.image } : {}"),
    "should only overwrite image with a dynamic spread when provided",
  );
  assert.ok(
    !dalSrc.includes("image: null"),
    "must never write an unconditional image: null",
  );
});

// --- Storage: avatar lives in its own bucket + upsert ---

test("uploadAvatar uses 'avatars' bucket", () => {
  assert.ok(
    storageSrc.includes('from("avatars")'),
    "should upload to the avatars bucket",
  );
});

test("uploadAvatar path is `${userId}/avatar.*` with upsert", () => {
  assert.ok(
    storageSrc.includes("`${userId}/avatar.${extension}`"),
    "should scope path to the owning userId",
  );
  assert.ok(
    storageSrc.includes("upsert: true"),
    "should upsert to avoid orphaned colliding files",
  );
});

// --- SEC-5: password UI hidden for OAuth accounts (data-driven) ---

test("settings page detects OAuth via accounts length (SEC-5)", () => {
  assert.ok(
    settingsPageSrc.includes("const isOAuth = user.accounts.length > 0;"),
    "should derive OAuth state from linked accounts",
  );
});

test("PasswordForm rendered only when !isOAuth", () => {
  assert.ok(
    settingsPageSrc.includes("PasswordForm"),
    "page should host the password section",
  );
  assert.ok(
    settingsPageSrc.includes("!isOAuth ?") &&
      settingsPageSrc.includes("isOAuth ?"),
    "should gate the PasswordForm behind the !isOAuth branch",
  );
});

// --- Summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);