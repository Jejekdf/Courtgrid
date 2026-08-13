import 'server-only';

import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Sanitized user DTO returned to client-facing code.
 *
 * Excludes sensitive fields such as `passwordHash`.
 */
export type UserDTO = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  image: string | null;
  hasPasswordAccount: boolean;
  createdAt: string;
};

/**
 * Data Access Layer: Get currently authenticated user with DTO sanitization.
 *
 * Uses `cache()` to prevent duplicate database hits within the same request.
 *
 * @returns Sanitized user DTO or `null` when unauthenticated.
 */
export const getCurrentUser = cache(async (): Promise<UserDTO | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      passwordHash: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return null;

  // DTO Sanitization: Never expose passwordHash to client layers
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "ADMIN" | "CUSTOMER",
    image: user.image,
    hasPasswordAccount: !!user.passwordHash,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
  };
});

/**
 * Data Access Layer: Verify user ownership / RBAC access.
 *
 * Optionally enforces a required role and throws descriptive errors
 * when the session is missing or the role does not match.
 *
 * @param requiredRole - Optional role constraint.
 * @returns Sanitized user DTO.
 * @throws When unauthenticated or role-mismatched.
 */
export const verifyUserSession = cache(async (requiredRole?: "ADMIN" | "CUSTOMER") => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Akses memerlukan otentikasi.");
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error(`Forbidden: Akses hanya diperbolehkan untuk ${requiredRole}.`);
  }

  return user;
});

/**
 * Data Access Layer: Update user profile.
 *
 * Updates at minimum `name` and `email`, and optionally `image` if provided.
 *
 * @param userId - Target user ID.
 * @param data - Partial profile payload.
 * @returns Updated user record.
 */
export const updateUserProfileDAL = cache(async (userId: string, data: { name: string; email: string; image?: string }) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      ...(data.image ? { image: data.image } : {}),
    },
  });
});

/**
 * Data Access Layer: Change user password.
 *
 * Expects `passwordHash` to already be hashed before calling this DAL.
 *
 * @param userId - Target user ID.
 * @param passwordHash - Bcrypt-hashed password string.
 * @returns Updated user record.
 */
export const changePasswordDAL = cache(async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
});
