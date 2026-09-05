"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import {
  fetchAvailability,
  type AvailabilitySlot,
} from "@/lib/api/courts";
import { courtKeys } from "@/lib/query-keys";
import { getJakartaNow } from "@/lib/timezone";
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
  const { dateStr: todayStr } = getJakartaNow();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

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
          <CalendarDays className="h-4 w-4 text-zinc-500" />
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
            className="text-sm border border-zinc-200 rounded-md px-2 py-1 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{t("perHourShort", { price: `Rp ${pricePerHour.toLocaleString("id-ID")}` })}</span>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-8 gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t("loadingAvailability")}</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
      {selectedHour !== null && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-emerald-900 block">
              Jam Dipilih: {String(selectedHour).padStart(2, "0")}:00 – {String(selectedHour + 1).padStart(2, "0")}:00
            </span>
            <span className="text-[0.6875rem] text-emerald-700 block">
              Tanggal: {selectedDate}
            </span>
          </div>
          <Link
            href={`/dashboard/book?courtId=${courtId}&date=${selectedDate}&time=${String(selectedHour).padStart(2, "0")}:00`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs min-h-9"
          >
            <span>Lanjut Booking</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

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
