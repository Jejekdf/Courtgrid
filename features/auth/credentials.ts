import bcrypt from "bcryptjs";

export type CredentialUser = { passwordHash: string | null };

/**
 * Verify an email/password attempt against a stored user record (AC-LOGIN-1/2).
 *
 * Pure credential check used by the NextAuth `Credentials` authorize() callback.
 * Returns false for missing user or OAuth-only accounts (no passwordHash, SEC-5).
 */
export async function verifyCredentialsPassword(
  user: CredentialUser | null,
  password: string,
): Promise<boolean> {
  if (!user || !user.passwordHash) {
    return false;
  }
  return bcrypt.compare(password, user.passwordHash);
}