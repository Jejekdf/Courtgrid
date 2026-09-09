"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import {
  fetchAvailability,
  type AvailabilitySlot,
} from "@/lib/api/courts";
import { courtKeys } from "@/lib/query-keys";
import { getJakartaNow } from "@/lib/timezone";
import { safeFormatDate, formatRupiah } from "@/lib/utils";
import { SlotCell } from "./SlotCell";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface Props {
  courtId: string;
  pricePerHour: number;
}

export default function AvailabilityGrid({
  courtId,
  pricePerHour,
}: Props) {
  const t = useTranslations("courts");
  const locale = useLocale();
  const { dateStr: todayStr } = getJakartaNow();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const formattedDate = safeFormatDate(selectedDate, "EEE, d MMM yyyy", selectedDate, locale);
  const startHourStr = selectedHour !== null ? String(selectedHour).padStart(2, "0") : "00";
  const endHourStr = selectedHour !== null ? String(selectedHour + 1).padStart(2, "0") : "00";

  const maxDate = addDays(todayStr, 14);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: courtKeys.availability(courtId, selectedDate),
    queryFn: () => fetchAvailability(courtId, selectedDate),
  });

  const slots: AvailabilitySlot[] = data ?? [];
  const freeCount = slots.filter((s) => s.status === "FREE").length;

  return (
    <div className="space-y-4 p-4 bg-white border border-zinc-200 rounded-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-zinc-500" />
          <label
            htmlFor={`date-${courtId}`}
            className="text-sm font-semibold text-zinc-700"
          >
            {t("pickDate")}
          </label>
          <input
            id={`date-${courtId}`}
            type="date"
            value={selectedDate}
            min={todayStr}
            max={maxDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedHour(null);
            }}
            className="text-sm border border-zinc-200 rounded-md px-2 py-1 bg-white text-zinc-900 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Clock className="size-3.5" />
          <span>{t("perHourShort", { price: formatRupiah(pricePerHour) })}</span>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-8 gap-2 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" />
          <span>{t("loadingAvailability")}</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <AlertTriangle className="size-5 text-red-500" />
          <span className="text-sm text-red-600">
            {t("availabilityError")}
          </span>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-emerald-600 hover:underline"
          >
            {t("retry")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {slots.map((slot) => (
              <SlotCell
                key={slot.hour}
                slot={slot}
                isSelected={selectedHour === slot.hour}
                onSelect={(hour) =>
                  setSelectedHour(selectedHour === hour ? null : hour)
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Selected Hour Action Bar */}
      <AnimatePresence>
        {selectedHour !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            role="region"
            aria-live="polite"
            className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-950">
              <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200/80 px-2.5 py-1 rounded-md shadow-2xs">
                <CalendarDays className="size-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <time dateTime={selectedDate}>{formattedDate}</time>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200/80 px-2.5 py-1 rounded-md shadow-2xs font-mono">
                <Clock className="size-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <time dateTime={`${startHourStr}:00`}>{startHourStr}:00</time>
                <span className="text-zinc-400">/</span>
                <time dateTime={`${endHourStr}:00`}>{endHourStr}:00 WIB</time>
              </span>
            </div>
            <Link
              href={`/dashboard/book?courtId=${courtId}&date=${selectedDate}&time=${startHourStr}:00`}
              aria-label={`${t("continueBooking")} ${formattedDate} ${startHourStr}:00`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] text-white text-xs font-bold rounded-lg transition-[background-color,transform] shadow-xs w-full sm:w-auto min-h-10 cursor-pointer"
            >
              <span>{t("continueBooking")}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPending && !isError && freeCount === 0 && (
        <p className="text-center text-xs text-zinc-500 pt-1">
          {t("noSlotsAvailable")}
        </p>
      )}

      {!isPending && !isError && freeCount > 0 && selectedHour === null && (
        <p className="text-center text-xs text-zinc-500 pt-1">
          {t("slotsAvailable", { count: freeCount, total: slots.length })}
        </p>
      )}
    </div>
  );
}
