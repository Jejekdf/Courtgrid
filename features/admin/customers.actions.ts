"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { checkAdmin } from "./auth-guard";

export type CustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
};

export type PaginatedCustomersResult =
  | { success: false; error: string; customers: never[]; totalCount: 0; totalPages: 1; currentPage: 1 }
  | { customers: CustomerRow[]; totalCount: number; totalPages: number; currentPage: number };

/**
 * Permanently deletes a customer account.
 */
export async function adminDeleteCustomer(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: t("onlyAdminDelete") };
    }
  }
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin/customers");
  return { success: true };
}

/**
 * Swaps a user's role between ADMIN and CUSTOMER.
 *
 * Only demotion is supported: exactly one Super Admin must always remain, and
 * there is no UI to promote a customer. Demotion is allowed only while another
 * admin would still exist.
 */
export async function adminToggleUserRole(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return { success: false, error: t("userNotFound") };

  if (user.role === "CUSTOMER") {
    return {
      success: false,
      error: t("adminCreateNotAllowed"),
    };
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    return { success: false, error: t("onlyAdminRoleSwap") };
  }

  await prisma.user.update({ where: { id }, data: { role: "CUSTOMER" } });
  revalidatePath("/admin/customers");
  return { success: true, role: "CUSTOMER" as const };
}

/**
 * Paginated customers with optional name/email search.
 */
export async function getAdminPaginatedCustomersAction(
  search?: string,
  page = 1,
  pageSize = 10
): Promise<PaginatedCustomersResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return {
      success: false as const,
      error: adminCheck.error,
      customers: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
  const { getAdminPaginatedCustomersDAL } = await import("@/features/admin/dal");
  return getAdminPaginatedCustomersDAL(search, page, pageSize);
}
