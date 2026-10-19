"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { voucherSchema } from "./schemas";

/**
 * Checks that the current session belongs to an admin.
 *
 * Returns a typed failure instead of throwing so server actions can respond
 * with a controlled `{ success: false, error }` object.
 */
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    const t = await getTranslations("validation");
    return { success: false as const, error: t("unauthorizedAdmin") };
  }

  return { success: true as const };
}

export async function adminGetVouchers() {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return [];
  }
  return prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
}

export async function adminCreateVoucher(formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const raw = {
    code: formData.get("code"),
    discountPct: formData.get("discountPct"),
    maxDiscount: formData.get("maxDiscount") || null,
    minSpend: formData.get("minSpend"),
    expiresAt: formData.get("expiresAt"),
    maxUses: formData.get("maxUses"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };

  const parsed = voucherSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const exists = await prisma.voucher.findUnique({ where: { code: parsed.data.code } });
  if (exists) {
    const t = await getTranslations("validation");
    return { success: false, error: t("voucherExists") };
  }

  await prisma.voucher.create({ data: parsed.data });
  revalidatePath("/admin/vouchers");
  return { success: true };
}

export async function adminUpdateVoucher(id: string, formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const raw = {
    code: formData.get("code"),
    discountPct: formData.get("discountPct"),
    maxDiscount: formData.get("maxDiscount") || null,
    minSpend: formData.get("minSpend"),
    expiresAt: formData.get("expiresAt"),
    maxUses: formData.get("maxUses"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };

  const parsed = voucherSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const conflict = await prisma.voucher.findFirst({
    where: { code: parsed.data.code, NOT: { id } },
  });
  if (conflict) {
    const t = await getTranslations("validation");
    return { success: false, error: t("voucherExists") };
  }

  // Guard: cannot reduce maxUses below already used count
  const used = await prisma.reservation.count({
    where: { voucherId: id, status: { not: "CANCELED" } },
  });
  if (parsed.data.maxUses < used) {
    const t = await getTranslations("validation");
    return { success: false, error: t("voucherQuotaBelowUsage") };
  }

  await prisma.voucher.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/vouchers");
  return { success: true };
}

export async function adminDeleteVoucher(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const used = await prisma.reservation.count({
    where: { voucherId: id, status: { not: "CANCELED" } },
  });
  if (used > 0) {
    const t = await getTranslations("validation");
    return { success: false, error: t("voucherInUseDelete") };
  }

  await prisma.voucher.delete({ where: { id } });
  revalidatePath("/admin/vouchers");
  return { success: true };
}

export async function adminToggleVoucherActive(id: string, isActive: boolean) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  await prisma.voucher.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/vouchers");
  return { success: true };
}

/**
 * Validates a voucher code against current subtotal and returns computed discount.
 */
export async function validateVoucherAction(code: string, totalPrice: number) {
  const t = await getTranslations("validation");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: t("unauthorized") };
  }

  const { checkRateLimitRelaxed } = await import("@/lib/ratelimit");
  const { success: allowed } = await checkRateLimitRelaxed(`voucher_validate:${session.user.id}`);
  if (!allowed) {
    return {
      success: false as const,
      error: t("voucherRateLimit"),
    };
  }

  const cleanCode = code?.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false as const, error: t("voucherEmpty") };
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code: cleanCode },
  });

  if (!voucher || !voucher.isActive) {
    return { success: false as const, error: t("voucherInvalidOrInactive") };
  }

  if (voucher.expiresAt < new Date()) {
    return { success: false as const, error: t("voucherExpired") };
  }

  if (totalPrice < voucher.minSpend) {
    return {
      success: false as const,
      error: t("voucherMinSpendMsg", { amount: voucher.minSpend.toLocaleString("id-ID") }),
    };
  }

  if (voucher.maxUses !== null && voucher.maxUses !== undefined) {
    const usedCount = await prisma.reservation.count({
      where: { voucherId: voucher.id, status: { not: "CANCELED" } },
    });
    if (usedCount >= voucher.maxUses) {
      return { success: false as const, error: t("voucherQuotaExceeded") };
    }
  }

  const discountAmount = Math.min(
    Math.round((totalPrice * voucher.discountPct) / 100),
    voucher.maxDiscount ?? Infinity
  );

  const finalTotalPrice = Math.max(0, totalPrice - discountAmount);

  return {
    success: true as const,
    code: voucher.code,
    discountPct: voucher.discountPct,
    discountAmount,
    finalTotalPrice,
  };
}
