"use client";

import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";

export type RevenueChartDatum = {
  date: string;
  revenue: number;
};

type RevenueTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
};

function RevenueTooltip(props: RevenueTooltipProps) {
  if (!props.active || !props.payload?.length) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{String(props.label)}</p>
      <p className="text-sm font-bold text-zinc-950">
        {formatRupiah(props.payload[0].value)}
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: { data: RevenueChartDatum[] }) {
  const chartData = data.map((item) => ({
    label: new Date(item.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    revenue: item.revenue,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
      className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
    >
      <div className="px-6 py-5 border-b border-zinc-200 flex flex-col gap-1">
        <h3 className="text-lg font-medium tracking-tight text-zinc-950">
          Revenue 7 Hari Terakhir
        </h3>
        <p className="text-sm text-zinc-500">
          Pendapatan dari reservasi DP Paid &amp; Done dalam 7 hari terakhir.
        </p>
      </div>

      <div className="px-6 py-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 0,
                }).format(value)
              }
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "#f4f4f5" }} content={<RevenueTooltip />} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#171717" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
