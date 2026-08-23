"use client";

import { CalendarCheck, Box, Clock, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardStatsProps {
  totalReservations: number;
  totalRevenue: number;
  activeCourts: number;
  pendingCount?: number;
}

export default function DashboardStats({
  totalReservations,
  totalRevenue,
  activeCourts,
  pendingCount = 0,
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
      title: t("statReservations"),
      value: totalReservations.toString(),
      sub: t("statReservationsSub"),
      icon: CalendarCheck,
    },
    {
      title: t("statRevenue"),
      value: formattedRevenue,
      sub: t("statRevenueSub"),
      icon: Wallet,
    },
    {
      title: t("statCourts"),
      value: activeCourts.toString(),
      sub: t("statCourtsSub"),
      icon: Box,
    },
    {
      title: t("statPending"),
      value: pendingCount.toString(),
      sub: t("statPendingSub"),
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {stat.sub}
              </span>
              <Icon className="size-4 text-zinc-950" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-zinc-500">{stat.title}</p>
          </div>
        );
      })}
    </div>
  );
}
