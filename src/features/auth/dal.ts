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
 * Returns the currently authenticated user, sanitized for client-facing code.
 *
 * `cache()` dedupes DB hits within the same request.
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

  // Never leak passwordHash to client layers.
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
 * Returns the current user, optionally enforcing a required role.
 *
 * Throws when the session is missing or the role does not match.
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
 * Updates a user's profile: name and email always, image only when provided.
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
 * Replaces a user's password hash. The new value must already be hashed.
 */
export const changePasswordDAL = cache(async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
});
