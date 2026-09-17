"use client";

import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

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
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();

  const chartData = data.map((item) => {
    const [year, month, day] = item.date.split("-").map(Number);
    const dateObj = new Date(year, (month || 1) - 1, day || 1);
    return {
      label: dateObj.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
        day: "numeric",
        month: "short",
      }),
      revenue: item.revenue,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
      className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-200 flex flex-col gap-1">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 text-balance">
          {t("revenueChartTitle")}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 text-pretty">
          {t("revenueChartDesc")}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
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
