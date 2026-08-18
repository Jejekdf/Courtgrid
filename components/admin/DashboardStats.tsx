"use client";

import { CalendarCheck, Box, Clock, Wallet } from "lucide-react";

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
  const formattedRevenue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  const stats = [
    {
      title: "Total Reservasi",
      value: totalReservations.toString(),
      sub: "Semua Status",
      icon: CalendarCheck,
    },
    {
      title: "Total Pendapatan",
      value: formattedRevenue,
      sub: "DP Paid & Lunas",
      icon: Wallet,
    },
    {
      title: "Lapangan Aktif",
      value: activeCourts.toString(),
      sub: "Siap Disewa",
      icon: Box,
    },
    {
      title: "Menunggu DP",
      value: pendingCount.toString(),
      sub: "Status Pending",
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
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {stat.sub}
              </span>
              <Icon className="w-4 h-4 text-zinc-950" />
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
