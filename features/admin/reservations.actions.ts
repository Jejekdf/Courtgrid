"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getJakartaNow, jakartaDayBounds, jakartaMonthBounds, formatSlotHour } from "@/lib/timezone";
import { getAdminDashboardStatsDAL, type AdminStatsDTO } from "@/features/admin/dal";
import { getTranslations } from "next-intl/server";
import { checkAdmin } from "./auth-guard";

export type AdminReservationRow = {
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

export type PaginatedReservationsResult =
  | { success: false; error: string; reservations: never[]; totalCount: 0; totalPages: 1; currentPage: 1 }
  | { reservations: AdminReservationRow[]; totalCount: number; totalPages: number; currentPage: number };

/**
 * Paginated admin reservations, optionally scoped to today or this month.
 */
export async function getAllReservations(
  filter: "daily" | "monthly" | "all" = "all",
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedReservationsResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return {
      success: false as const,
      error: adminCheck.error,
      reservations: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }

  let dateFilter = {};

  if (filter === "daily") {
    const { start, end } = jakartaDayBounds(getJakartaNow().dateStr);
    dateFilter = { date: { gte: start, lt: end } };
  } else if (filter === "monthly") {
    const { start, end } = jakartaMonthBounds(getJakartaNow().dateStr);
    dateFilter = { date: { gte: start, lt: end } };
  }

  const [totalCount, rawReservations] = await Promise.all([
    prisma.reservation.count({ where: dateFilter }),
    prisma.reservation.findMany({
      where: dateFilter,
      orderBy: { startTime: "desc" },
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

/**
 * Hard-deletes a reservation by ID.
 */
export async function adminDeleteReservation(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  await prisma.reservation.delete({
    where: { id },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  return { success: true };
}

/**
 * Looks up a reservation by ID for ticket scanning, with user/court/payment
 * details so staff can verify identity and booking before check-in.
 */
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

/**
 * Marks a reservation as DONE after on-site check-in.
 */
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

  await prisma.reservation.update({
    where: { id: reservationId.trim() },
    data: { status: "DONE" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Check-in E-Ticket berhasil! Status reservasi ${reservationId.slice(0, 8)} diubah menjadi SELESAI (DONE).`,
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
