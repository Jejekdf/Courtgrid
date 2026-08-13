"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAvailability,
  type AvailabilitySlot,
  type SlotStatus,
} from "@/lib/api/courts";
import { courtKeys } from "@/lib/query-keys";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function getJakartaDate(): { dateStr: string; hour: number } {
  const now = Date.now() + JAKARTA_OFFSET_MS;
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return { dateStr: `${y}-${m}-${day}`, hour: d.getUTCHours() };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function slotLabel(status: SlotStatus): string {
  switch (status) {
    case "PAST":
      return "Lewat";
    case "BOOKED":
      return "Terisi";
    case "FREE":
      return "Tersedia";
  }
}

function slotStyle(status: SlotStatus, isSelected: boolean): string {
  if (status === "FREE") {
    if (isSelected) {
      return "bg-emerald-600 text-white border-emerald-600 shadow-md";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer";
  }
  return "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through";
}

interface Props {
  courtId: string;
  pricePerHour: number;
}

export default function AvailabilityGrid({
  courtId,
  pricePerHour,
}: Props) {
  const { dateStr: todayStr } = getJakartaDate();
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
            Pilih Tanggal
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
            className="text-xs border border-zinc-200 rounded-md px-2 py-1 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Rp {pricePerHour.toLocaleString("id-ID")}/jam</span>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-8 gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat ketersediaan...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-600">
            Gagal memuat ketersediaan.
          </span>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-emerald-600 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {slots.map((slot) => {
              const isDisabled = slot.status !== "FREE";
              const isSelected = selectedHour === slot.hour;

              return (
                <motion.button
                  key={slot.hour}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  disabled={isDisabled}
                  onClick={() =>
                    setSelectedHour(isSelected ? null : slot.hour)
                  }
                  className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${slotStyle(
                    slot.status,
                    isSelected
                  )}`}
                  aria-label={`${slot.startTime} - ${slotLabel(slot.status)}`}
                >
                  <span className="font-semibold tabular-nums">
                    {slot.startTime}
                  </span>
                  <span className="text-[11px] opacity-75">
                    {slotLabel(slot.status)}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!isPending && !isError && freeCount === 0 && (
        <p className="text-center text-sm text-zinc-400 pt-1">
          Tidak ada jam tersedia untuk tanggal ini.
        </p>
      )}

      {!isPending && !isError && freeCount > 0 && (
        <p className="text-center text-sm text-zinc-400 pt-1">
          {freeCount} jam tersedia dari 14 slot.
        </p>
      )}
    </div>
  );
}
