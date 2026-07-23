"use client";

import { CalendarCheck, DollarSign, Box } from "lucide-react";

interface DashboardStatsProps {
  totalReservations: number;
  totalRevenue: number;
  activeCourts: number;
}

export default function DashboardStats({
  totalReservations,
  totalRevenue,
  activeCourts,
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
      trend: "Data Aktual",
      trendUp: true,
      icon: CalendarCheck,
      desc: "Semua status",
    },
    {
      title: "Total Pendapatan",
      value: formattedRevenue,
      trend: "Data Aktual",
      trendUp: true,
      icon: DollarSign,
      desc: "Lunas & DP Paid",
    },
    {
      title: "Lapangan Aktif",
      value: activeCourts.toString(),
      trend: "Status",
      trendUp: true,
      icon: Box,
      desc: "Beroperasi",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="group relative bg-white p-6 rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Soft hover gradient background (21st.dev style) */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500">
                {stat.title}
              </span>
              <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-white group-hover:border-zinc-200">
                <Icon className="w-5 h-5 text-zinc-950" />
              </div>
            </div>
            
            <div className="relative mt-4">
              <h3 className="text-3xl font-bold tracking-tight text-zinc-950">
                {stat.value}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs font-semibold ${
                    stat.trendUp ? "text-emerald-600" : "text-zinc-500"
                  }`}
                >
                  {stat.trend}
                </span>
                <span className="text-xs text-zinc-500">{stat.desc}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
