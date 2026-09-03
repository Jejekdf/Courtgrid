import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyUserSession } from "@/features/auth/dal";
import { getJakartaNow, jakartaDayBounds, jakartaMonthBounds, formatSlotHour } from "@/lib/timezone";
import { getOrSetCache } from "@/lib/redis";


export type AdminStatsDTO = {
  totalReservations: number;
  totalRevenue: number;
  totalCourts: number;
  pendingCount: number;
  recentReservations: Array<{
    id: string;
    userName: string;
    userEmail: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
  }>;
  revenueChart: Array<{
    date: string;
    revenue: number;
  }>;
};

/**
 * Ensures the current user is an admin before any admin DAL call proceeds.
 */
export const verifyAdminSession = cache(async () => {
  return verifyUserSession("ADMIN");
});

/**
 * 7-day revenue series for the admin dashboard, computed in parallel.
 */
export const getAdminRevenueChartDAL = cache(async (): Promise<AdminStatsDTO["revenueChart"]> => {
  await verifyAdminSession();

  const todayStr = getJakartaNow().dateStr;
  const chart: AdminStatsDTO["revenueChart"] = [];

  for (let i = 6; i >= 0; i--) {
    // Revenue windows computed in Asia/Jakarta, stored as UTC.
    const dayDate = new Date(todayStr + "T00:00:00.000Z");
    dayDate.setUTCDate(dayDate.getUTCDate() - i);
    const dayStr = dayDate.toISOString().slice(0, 10);
    const { start, end } = jakartaDayBounds(dayStr);

    const result = await prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: {
        date: {
          gte: start,
          lt: end,
        },
        status: {
          in: ["DP_PAID", "DONE"],
        },
      },
    });

    chart.push({
      date: dayStr,
      revenue: result._sum.totalPrice || 0,
    });
  }

  return chart;
});

/**
 * Aggregates dashboard totals, recent reservations, and the revenue chart.
 */
export const getAdminDashboardStatsDAL = cache(async (): Promise<AdminStatsDTO> => {
  await verifyAdminSession();

  return getOrSetCache<AdminStatsDTO>(
    "admin:dashboard:stats",
    async () => {
      const [totalReservations, totalCourts, revenueResult, pendingCount, recent, revenueChart] =
        await Promise.all([
          prisma.reservation.count(),
          prisma.court.count(),
          prisma.reservation.aggregate({
            _sum: { totalPrice: true },
            where: { status: { in: ["DP_PAID", "DONE"] } },
          }),
          prisma.reservation.count({ where: { status: "PENDING" } }),
          prisma.reservation.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              totalPrice: true,
              status: true,
              user: { select: { name: true, email: true } },
              court: { select: { name: true } },
            },
          }),
          getAdminRevenueChartDAL(),
        ]);

      return {
        totalReservations,
        totalRevenue: revenueResult._sum.totalPrice || 0,
        totalCourts,
        pendingCount,
        recentReservations: recent.map((r) => ({
          id: r.id,
          userName: r.user?.name || "Customer",
          userEmail: r.user?.email || "",
          courtName: r.court?.name || "",
          date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
          startTime: formatSlotHour(r.startTime),
          endTime: formatSlotHour(r.endTime),
          totalPrice: r.totalPrice,
          status: r.status,
        })),
        revenueChart,
      };
    },
    15 // 15 seconds TTL in Redis
  );
});

/**
 * Paginated reservations for the admin list, with optional day/month scope.
 */
export const getAdminPaginatedReservationsDAL = cache(
  async (filter: "daily" | "monthly" | "all" = "all", page = 1, pageSize = 10) => {
    await verifyAdminSession();

    let dateFilter = {};

    if (filter === "daily") {
      const { start, end } = jakartaDayBounds(getJakartaNow().dateStr);
      dateFilter = { date: { gte: start, lt: end } };
    } else if (filter === "monthly") {
      const { start, end } = jakartaMonthBounds(getJakartaNow().dateStr);
      dateFilter = { date: { gte: start, lt: end } };
    }

    const [totalCount, reservations] = await Promise.all([
      prisma.reservation.count({ where: dateFilter }),
      prisma.reservation.findMany({
        where: dateFilter,
        orderBy: { date: "desc" },
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
          court: { select: { name: true } },
          payment: { select: { dpAmount: true, status: true } },
        },
      }),
    ]);

    return {
      reservations: reservations.map((r) => ({
        id: r.id,
        date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
        startTime: formatSlotHour(r.startTime),
        endTime: formatSlotHour(r.endTime),
        totalPrice: r.totalPrice,
        status: r.status,
        userName: r.user?.name || "Customer",
        userEmail: r.user?.email || "",
        courtName: r.court?.name || "",
        paymentStatus: r.payment?.status,
        dpAmount: r.payment?.dpAmount,
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
      currentPage: page,
    };
  }
);

export type CustomerDTO = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
};

/**
 * Paginated customers with case-insensitive name/email search.
 */
export const getAdminPaginatedCustomersDAL = cache(
  async (search?: string, page = 1, pageSize = 10) => {
    await verifyAdminSession();

    const whereCondition = search
      ? {
          role: "CUSTOMER" as const,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { role: "CUSTOMER" as const };

    const [totalCount, customers] = await Promise.all([
      prisma.user.count({ where: whereCondition }),
      prisma.user.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { reservations: true } },
          reservations: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true, totalPrice: true },
          },
        },
      }),
    ]);

    return {
      customers: customers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
        totalBookings: user._count.reservations,
        totalSpent: user.reservations.reduce((sum, r) => sum + r.totalPrice, 0),
        lastBookingAt: user.reservations[0]?.createdAt
          ? user.reservations[0].createdAt instanceof Date
            ? user.reservations[0].createdAt.toISOString()
            : String(user.reservations[0].createdAt)
          : null,
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
      currentPage: page,
    };
  }
);
