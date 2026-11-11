import 'server-only';

import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Public user profile shape with sensitive fields like `passwordHash` stripped out.
 */
export type UserDTO = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  image: string | null;
  hasPasswordAccount: boolean;
  accounts: Array<{ provider: string }>;
  createdAt: string;
};

/**
 * Fetches the authenticated user for the current request, deduplicating DB queries via React `cache()`.
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

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "ADMIN" | "CUSTOMER",
    image: user.image,
    hasPasswordAccount: !!user.passwordHash,
    accounts: user.accounts,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
  };
});

/**
 * Asserts an active session and optional role requirement against the database.
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

export async function updateUserProfileDAL(userId: string, data: { name: string; email: string; image?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      ...(data.image ? { image: data.image } : {}),
    },
  });
}

export async function updateUserAvatarDAL(userId: string, image: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { image },
  });
}

export async function changePasswordDAL(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
