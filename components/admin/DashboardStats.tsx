"use client";

import { CalendarCheck, Box, Clock, Wallet, Users, Activity } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardStatsProps {
  totalReservations: number;
  totalRevenue: number;
  activeCourts: number;
  pendingCount?: number;
  totalCustomers?: number;
  newCustomersThisMonth?: number;
  occupancyRateToday?: number;
  bookedHoursToday?: number;
  totalCapacityToday?: number;
}

export default function DashboardStats({
  totalReservations,
  totalRevenue,
  activeCourts,
  pendingCount = 0,
  totalCustomers = 0,
  newCustomersThisMonth = 0,
  occupancyRateToday = 0,
  bookedHoursToday = 0,
  totalCapacityToday = 0,
}: DashboardStatsProps) {
  const t = useTranslations("admin.dashboard");
  const formattedRevenue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  const stats = [
    {
      title: t("statRevenue"),
      value: formattedRevenue,
      sub: t("statRevenueSub"),
      icon: Wallet,
      badge: null,
    },
    {
      title: t("statReservations"),
      value: totalReservations.toLocaleString("id-ID"),
      sub: t("statReservationsSub"),
      icon: CalendarCheck,
      badge: null,
    },
    {
      title: t("statCustomers"),
      value: totalCustomers.toLocaleString("id-ID"),
      sub: t("statCustomersSub"),
      icon: Users,
      badge: newCustomersThisMonth > 0 ? t("statCustomersGrowth", { count: newCustomersThisMonth }) : null,
    },
    {
      title: t("statOccupancy"),
      value: `${occupancyRateToday}%`,
      sub: t("statOccupancySub"),
      icon: Activity,
      badge: totalCapacityToday > 0 ? t("statOccupancyDetail", { booked: bookedHoursToday, total: totalCapacityToday }) : null,
    },
    {
      title: t("statCourts"),
      value: activeCourts.toString(),
      sub: t("statCourtsSub"),
      icon: Box,
      badge: null,
    },
    {
      title: t("statPending"),
      value: pendingCount.toString(),
      sub: t("statPendingSub"),
      icon: Clock,
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col justify-between space-y-1 transition-colors hover:border-zinc-300"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[0.6875rem] font-mono font-bold uppercase tracking-wider text-zinc-400 truncate">
                {stat.sub}
              </span>
              <Icon className="size-4 text-zinc-950 shrink-0" />
            </div>

            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-zinc-950">
              {stat.value}
            </p>

            <div className="flex items-center justify-between gap-1 pt-0.5">
              <p className="text-xs sm:text-sm font-medium text-zinc-500 truncate">{stat.title}</p>
              {stat.badge && (
                <span className="text-[0.625rem] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-800 shrink-0">
                  {stat.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
