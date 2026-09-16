"use client";

import { motion } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Flame, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export type HourlySlotDatum = {
  hour: number;
  label: string;
  count: number;
  intensity: "low" | "medium" | "high" | "peak";
};

interface PeakHoursCardProps {
  data: HourlySlotDatum[];
  peakHour: string;
  peakHourCount: number;
}

type SlotTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: HourlySlotDatum; value: number }>;
  label?: string | number;
};

function SlotTooltip({ active, payload }: SlotTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const nextHour = (item.hour + 1).toString().padStart(2, "0") + ":00";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm font-sans">
      <p className="text-xs font-mono font-medium text-zinc-500">
        {item.label} - {nextHour} WIB
      </p>
      <p className="text-sm font-bold font-mono text-zinc-950">
        {item.count} <span className="font-sans font-normal text-xs text-zinc-600">reservasi</span>
      </p>
    </div>
  );
}

function getBarColor(intensity: HourlySlotDatum["intensity"]) {
  switch (intensity) {
    case "peak":
      return "#18181b"; // zinc-900 (strongest contrast)
    case "high":
      return "#52525b"; // zinc-600
    case "medium":
      return "#a1a1aa"; // zinc-400
    case "low":
    default:
      return "#e4e4e7"; // zinc-200
  }
}

export default function PeakHoursCard({
  data,
  peakHour,
  peakHourCount,
}: PeakHoursCardProps) {
  const t = useTranslations("admin.dashboard");
  const hasData = Array.isArray(data) && data.some((d) => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between"
    >
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 text-balance">
            {t("peakHoursTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 text-pretty">
            {t("peakHoursDesc")}
          </p>
        </div>

        {hasData && peakHour && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl sm:rounded-full bg-zinc-100 border border-zinc-200 text-xs sm:text-sm font-mono font-semibold text-zinc-900 self-start sm:self-auto shrink-0 max-w-full">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="size-3.5 sm:size-4 text-amber-600 shrink-0" />
              <span>{t("peakHourBadge", { time: peakHour })}</span>
            </span>
            <span className="hidden sm:inline text-zinc-400">|</span>
            <span className="text-zinc-600 font-sans sm:font-mono text-xs sm:text-sm">
              {t("peakBookingsCount", { count: peakHourCount })}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
        {hasData ? (
          <div className="w-full">
            <div className="w-full overflow-x-auto overflow-y-hidden pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
              <div className="min-w-[560px] sm:min-w-full h-[260px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 4 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#71717a", fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tick={{ fontSize: 11, fill: "#a1a1aa", fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip cursor={{ fill: "#f4f4f5" }} content={<SlotTooltip />} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {data.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={getBarColor(entry.intensity)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="sm:hidden text-[0.6875rem] text-zinc-400 font-mono text-center pt-2">
              {t("peakScrollHint")}
            </p>
          </div>
        ) : (
          <div className="h-[260px] sm:h-[280px] flex items-center justify-center text-sm text-zinc-500 font-mono">
            {t("noPeakData")}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-zinc-50 border-t border-zinc-200 flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-600">
        <TrendingUp className="size-4 sm:size-4.5 text-zinc-900 shrink-0 mt-0.5" />
        <p className="text-pretty leading-relaxed">
          <strong className="font-semibold text-zinc-900">{t("peakTipTitle")}: </strong>
          {t("peakTipDesc")}
        </p>
      </div>
    </motion.div>
  );
}
