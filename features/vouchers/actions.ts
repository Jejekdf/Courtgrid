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
  if (exists) return { success: false, error: "Kode voucher sudah ada" };

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
  if (conflict) return { success: false, error: "Kode voucher sudah dipakai voucher lain" };

  // Guard: cannot reduce maxUses below already used count
  const used = await prisma.reservation.count({
    where: { voucherId: id, status: { not: "CANCELED" } },
  });
  if (parsed.data.maxUses < used) {
    return { success: false, error: `Kuota tidak bisa di bawah pemakaian saat ini (${used})` };
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
    return { success: false, error: "Tidak bisa hapus voucher yang masih terpakai reservasi aktif" };
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
