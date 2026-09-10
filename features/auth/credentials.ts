import bcrypt from "bcryptjs";

export type CredentialUser = { passwordHash: string | null };

const DUMMY_HASH = "$2b$10$neHMer3Cp7wRiwxa3UsDkeJ0KPwCicPofto3tqMUGClRXzbV3l/WW";

/**
 * Verify an email/password attempt against a stored user record.
 * Runs a dummy comparison for non-existent users to normalize response latency.
 */
export async function verifyCredentialsPassword(
  user: CredentialUser | null,
  password: string,
): Promise<boolean> {
  if (!user || !user.passwordHash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, user.passwordHash);
}