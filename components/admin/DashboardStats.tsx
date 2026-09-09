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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 line-clamp-1 font-sans">
                {stat.sub}
              </span>
              <div className="size-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <Icon className="size-4.5 text-zinc-950" />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-zinc-950 my-0.5">
              {stat.value}
            </p>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100">
              <p className="text-sm font-medium text-zinc-600 truncate">{stat.title}</p>
              {stat.badge && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0">
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
