import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyUserSession } from "@/features/auth/dal";
import { getJakartaNow, jakartaDayBounds, jakartaMonthBounds, formatSlotHour } from "@/lib/timezone";
import { getOrSetCache } from "@/lib/redis";


export type HourlyDistributionDatum = {
  hour: number;
  label: string;
  count: number;
  intensity: "low" | "medium" | "high" | "peak";
};

export type AdminStatsDTO = {
  totalReservations: number;
  totalRevenue: number;
  totalCourts: number;
  pendingCount: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  occupancyRateToday: number;
  bookedHoursToday: number;
  totalCapacityToday: number;
  peakHour: string;
  peakHourCount: number;
  hourlyDistribution: HourlyDistributionDatum[];
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
    paymentStatus?: string;
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
 * Aggregates dashboard totals, customer growth, occupancy, peak hours, recent bookings, and revenue chart.
 */
export const getAdminDashboardStatsDAL = cache(async (): Promise<AdminStatsDTO> => {
  await verifyAdminSession();

  return getOrSetCache<AdminStatsDTO>(
    "admin:dashboard:stats",
    async () => {
      const todayStr = getJakartaNow().dateStr;
      const { start: todayStart, end: todayEnd } = jakartaDayBounds(todayStr);
      const { start: monthStart } = jakartaMonthBounds(todayStr);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalReservations,
        totalCourts,
        activeCourtsCount,
        revenueResult,
        pendingCount,
        totalCustomers,
        newCustomersThisMonth,
        todayBookings,
        recentBookingsForPeak,
        recent,
        revenueChart,
      ] = await Promise.all([
        prisma.reservation.count(),
        prisma.court.count(),
        prisma.court.count({ where: { isActive: true } }),
        prisma.reservation.aggregate({
          _sum: { totalPrice: true },
          where: { status: { in: ["DP_PAID", "DONE"] } },
        }),
        prisma.reservation.count({ where: { status: "PENDING" } }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: monthStart } } }),
        prisma.reservation.findMany({
          where: {
            date: { gte: todayStart, lt: todayEnd },
            status: { in: ["DP_PAID", "DONE"] },
          },
          select: { startTime: true, endTime: true },
        }),
        prisma.reservation.findMany({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            status: { in: ["DP_PAID", "DONE"] },
          },
          select: { startTime: true, endTime: true },
        }),
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
            payment: { select: { status: true } },
          },
        }),
        getAdminRevenueChartDAL(),
      ]);

      // Occupancy Rate Today: 14 available slot hours per active court (08:00 - 22:00)
      const totalCapacityToday = Math.max(1, activeCourtsCount * 14);
      let bookedHoursToday = 0;
      for (const b of todayBookings) {
        const h = Math.max(1, b.endTime.getUTCHours() - b.startTime.getUTCHours());
        bookedHoursToday += h;
      }
      const occupancyRateToday = Math.min(100, Math.round((bookedHoursToday / totalCapacityToday) * 100));

      // Peak Hours Analysis (14 operational slots: 8..21)
      const slotCounts: Record<number, number> = {};
      for (let h = 8; h <= 21; h++) {
        slotCounts[h] = 0;
      }
      for (const b of recentBookingsForPeak) {
        const startH = b.startTime.getUTCHours();
        const endH = b.endTime.getUTCHours();
        for (let h = startH; h < endH; h++) {
          if (slotCounts[h] !== undefined) {
            slotCounts[h]++;
          }
        }
      }

      let topHour = 19;
      let maxCount = 0;
      for (let h = 8; h <= 21; h++) {
        if (slotCounts[h] > maxCount) {
          maxCount = slotCounts[h];
          topHour = h;
        }
      }

      const pad = (n: number) => String(n).padStart(2, "0");
      const peakHour = `${pad(topHour)}:00 - ${pad(topHour + 1)}:00`;

      const hourlyDistribution: HourlyDistributionDatum[] = [];
      for (let h = 8; h <= 21; h++) {
        const count = slotCounts[h];
        let intensity: HourlyDistributionDatum["intensity"] = "low";
        if (count === maxCount && maxCount > 0) {
          intensity = "peak";
        } else if (maxCount > 0 && count >= maxCount * 0.6) {
          intensity = "high";
        } else if (maxCount > 0 && count >= maxCount * 0.25) {
          intensity = "medium";
        }
        hourlyDistribution.push({
          hour: h,
          label: `${pad(h)}:00`,
          count,
          intensity,
        });
      }

      return {
        totalReservations,
        totalRevenue: revenueResult._sum.totalPrice || 0,
        totalCourts,
        pendingCount,
        totalCustomers,
        newCustomersThisMonth,
        occupancyRateToday,
        bookedHoursToday,
        totalCapacityToday,
        peakHour,
        peakHourCount: maxCount,
        hourlyDistribution,
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
          paymentStatus: r.payment?.status,
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
        orderBy: [{ date: "desc" }, { startTime: "asc" }, { createdAt: "desc" }],
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
