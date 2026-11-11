"use server";

import { auth } from "@/auth";
import { verifyUserSession } from "@/features/auth/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getJakartaNow, jakartaDayBounds, jakartaMonthBounds, formatSlotHour } from "@/lib/timezone";
import { invalidateCache, invalidateCachePattern } from "@/lib/redis";
import { getAdminDashboardStatsDAL, type AdminStatsDTO } from "@/features/admin/dal";

type AdminReservationRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string; type?: string } | null;
  payment: { dpAmount?: number; status?: string } | null;
};

type PaginatedReservationsResult =
  | { success: false; error: string; reservations: never[]; totalCount: 0; totalPages: 1; currentPage: 1 }
  | { reservations: AdminReservationRow[]; totalCount: number; totalPages: number; currentPage: number };

type AdminCourtRow = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
  imageUrl: string | null;
};

type CustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
};

type PaginatedCustomersResult =
  | { success: false; error: string; customers: never[]; totalCount: 0; totalPages: 1; currentPage: 1 }
  | { customers: CustomerRow[]; totalCount: number; totalPages: number; currentPage: number };



import { getTranslations } from "next-intl/server";
import { buildCourtSchema, type CreateCourtInput } from "@/features/admin/schemas";
import type { SchemaTranslator } from "@/lib/zod";

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    const t = await getTranslations("validation");
    return { success: false as const, error: t("unauthorizedAdmin") };
  }

  try {
    await verifyUserSession("ADMIN");
  } catch {
    const t = await getTranslations("validation");
    return { success: false as const, error: t("unauthorizedAdmin") };
  }

  return { success: true as const };
}

function parseCourtForm(
  formData: FormData,
  t?: SchemaTranslator
): { data: CreateCourtInput | null; error: string | null } {
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    pricePerHour: Number(formData.get("pricePerHour")),
    isActive: formData.get("isActive") === "true",
    imageUrl: (formData.get("imageUrl") as string | null)?.trim() ?? "",
  };

  const schema = buildCourtSchema(t);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }
  return { data: parsed.data, error: null };
}

export async function getAllReservations(
  filter: "daily" | "monthly" | "all" = "all",
  page: number = 1,
  pageSize: number = 10,
  statusFilter: "ALL" | "PENDING" | "DP_PAID" | "DONE" | "CANCELED" = "ALL",
): Promise<PaginatedReservationsResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, reservations: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }

  let dateFilter: Record<string, unknown> = {};

  if (filter === "daily") {
    // Day boundary must be Asia/Jakarta, not server-local TZ.
    const { start, end } = jakartaDayBounds(getJakartaNow().dateStr);
    dateFilter = { date: { gte: start, lt: end } };
  } else if (filter === "monthly") {
    const { start, end } = jakartaMonthBounds(getJakartaNow().dateStr);
    dateFilter = { date: { gte: start, lt: end } };
  }

  if (statusFilter && statusFilter !== "ALL") {
    dateFilter = { ...dateFilter, status: statusFilter };
  }

  const [totalCount, rawReservations] = await Promise.all([
    prisma.reservation.count({ where: dateFilter }),
    prisma.reservation.findMany({
      where: dateFilter,
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        totalPrice: true,
        status: true,
        user: { select: { name: true, email: true } },
        court: { select: { name: true, type: true } },
        payment: { select: { id: true, status: true, dpAmount: true } },
      },
    }),
  ]);

  const reservations = rawReservations.map((r) => ({
    ...r,
    date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
    startTime: formatSlotHour(r.startTime),
    endTime: formatSlotHour(r.endTime),
  }));

  return {
    reservations,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    currentPage: page,
  };
}

export async function adminDeleteReservation(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { userId: true, courtId: true, date: true },
    });

    await prisma.reservation.delete({
      where: { id },
    });

    const keysToInvalidate = ["admin:dashboard:stats"];
    if (reservation?.userId) {
      keysToInvalidate.push(`customer:${reservation.userId}:reservations`);
    }
    if (reservation?.courtId && reservation?.date) {
      const dateStr =
        reservation.date instanceof Date
          ? reservation.date.toISOString().slice(0, 10)
          : String(reservation.date).slice(0, 10);
      keysToInvalidate.push(`public:avail:${reservation.courtId}:${dateStr}`);
    }
    await invalidateCache(...keysToInvalidate);
    await invalidateCachePattern("public:avail:*");

    revalidatePath("/admin");
    revalidatePath("/admin/reservations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reservations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reservation:", error);
    const t = await getTranslations("validation");
    return { success: false, error: t("reservationDeleteFailed") };
  }
}

export async function adminGetCourts(): Promise<AdminCourtRow[]> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return [];
  }
  return prisma.court.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, type: true, pricePerHour: true, isActive: true, imageUrl: true } });
}

export async function adminCreateCourt(formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const t = await getTranslations("validation");
  const { data: courtData, error: validationError } = parseCourtForm(formData, t);
  if (validationError || !courtData) {
    return { success: false as const, error: validationError ?? t("courtTypeInvalid") };
  }

  try {
    const venue = await prisma.venue.findFirst();
    if (!venue) {
      return { success: false as const, error: t("venueNotRegistered") };
    }

    await prisma.court.create({
      data: {
        name: courtData.name,
        type: courtData.type,
        pricePerHour: courtData.pricePerHour,
        isActive: courtData.isActive,
        imageUrl: courtData.imageUrl || null,
        venue: { connect: { id: venue.id } },
      },
    });
    await invalidateCache("admin:dashboard:stats");
    await invalidateCachePattern("public:courts:*");
    revalidatePath("/admin/courts");
    revalidatePath("/courts");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    console.error("Error creating court:", error);
    return { success: false as const, error: t("courtCreateFailed") };
  }
}

export async function adminUpdateCourt(id: string, formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const t = await getTranslations("validation");
  const { data: courtData, error: validationError } = parseCourtForm(formData, t);
  if (validationError || !courtData) {
    return { success: false as const, error: validationError ?? t("courtTypeInvalid") };
  }

  try {
    await prisma.court.update({
      where: { id },
      data: {
        name: courtData.name,
        type: courtData.type,
        pricePerHour: courtData.pricePerHour,
        isActive: courtData.isActive,
        imageUrl: courtData.imageUrl || null,
      },
    });
    await invalidateCache("admin:dashboard:stats");
    await invalidateCachePattern("public:courts:*");
    revalidatePath("/admin/courts");
    revalidatePath("/courts");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    console.error("Error updating court:", error);
    return { success: false as const, error: t("courtUpdateFailed") };
  }
}

export async function adminDeleteCourt(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  await prisma.court.delete({ where: { id } });
  await invalidateCache("admin:dashboard:stats");
  await invalidateCachePattern("public:courts:*");
  revalidatePath("/admin/courts");
  revalidatePath("/courts");
  revalidatePath("/");
  return { success: true as const };
}

export async function adminToggleCourtActive(id: string, formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const isActive = formData.get("isActive") === "true";
  await prisma.court.update({
    where: { id },
    data: { isActive },
  });
  await invalidateCache("admin:dashboard:stats");
  await invalidateCachePattern("public:courts:*");
  revalidatePath("/admin/courts");
  revalidatePath("/courts");
  revalidatePath("/");
  return { success: true as const };
}

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

export async function getAdminPaginatedCustomersAction(search?: string, page = 1, pageSize = 10): Promise<PaginatedCustomersResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, customers: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
  const { getAdminPaginatedCustomersDAL } = await import("@/features/admin/dal");
  return getAdminPaginatedCustomersDAL(search, page, pageSize);
}

export async function adminScanTicket(reservationId: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const res = await prisma.reservation.findUnique({
    where: { id: reservationId.trim() },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      totalPrice: true,
      status: true,
      user: { select: { name: true, email: true } },
      court: { select: { name: true, type: true } },
      payment: { select: { dpAmount: true, status: true } },
    },
  });

  if (!res) {
    return {
      success: false,
      error: t("ticketNotFound"),
    };
  }

  return {
    success: true,
    reservation: {
      id: res.id,
      date: res.date instanceof Date ? res.date.toISOString() : String(res.date),
      startTime: formatSlotHour(res.startTime),
      endTime: formatSlotHour(res.endTime),
      totalPrice: res.totalPrice,
      status: res.status,
      user: res.user,
      court: res.court,
      payment: res.payment ? { dpAmount: res.payment.dpAmount, status: res.payment.status } : null,
    },
  };
}

export async function adminCheckInReservation(reservationId: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId.trim() },
  });

  if (!reservation) {
    return { success: false, error: t("reservationNotFound") };
  }

  if (reservation.status === "CANCELED") {
    return {
      success: false,
      error: t("ticketCanceled"),
    };
  }

  if (reservation.status === "DONE") {
    return {
      success: false,
      error: t("ticketAlreadyUsed"),
    };
  }

  if (reservation.status !== "DP_PAID") {
    return {
      success: false,
      error: t("ticketNotPaid"),
    };
  }

  const updated = await prisma.reservation.updateMany({
    where: { id: reservationId.trim(), status: "DP_PAID" },
    data: { status: "DONE" },
  });

  if (updated.count === 0) {
    return {
      success: false,
      error: t("ticketAlreadyUsed"),
    };
  }

  if (reservation.userId) {
    await invalidateCache("admin:dashboard:stats", `customer:${reservation.userId}:reservations`);
  } else {
    await invalidateCache("admin:dashboard:stats");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: t("checkInSuccessMsg"),
  };
}

export type AdminStatsActionResult =
  | { success: true; data: AdminStatsDTO }
  | { success: false; error: string; unauthorized?: boolean };

export async function getAdminStatsAction(): Promise<AdminStatsActionResult> {
  const t = await getTranslations("validation");
  try {
    const stats = await getAdminDashboardStatsDAL();
    if (!stats) {
      return { success: false, error: t("statsNotReady") };
    }
    return { success: true, data: stats };
  } catch (error) {
    const message = error instanceof Error ? error.message : t("statsNotReady");
    return { success: false, error: message, unauthorized: /Unauthorized|Forbidden/.test(message) };
  }
}
