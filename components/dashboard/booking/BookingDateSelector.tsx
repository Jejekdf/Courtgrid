"use client";

import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

interface BookingDateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  todayStr: string;
  tomorrowStr: string;
  dayAfterTomorrowStr: string;
}

export function BookingDateSelector({
  selectedDate,
  onSelectDate,
  todayStr,
  tomorrowStr,
  dayAfterTomorrowStr,
}: BookingDateSelectorProps) {
  const t = useTranslations("dashboard.bookingFlow");
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
          <CalendarIcon className="size-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-950">{t("dateTitle")}</h2>
          <p className="text-sm text-zinc-500 font-mono">
            {format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
      </div>

      {/* Date Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectDate(todayStr)}
          className={`px-4 py-2.5 min-h-11 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            selectedDate === todayStr
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950"
          }`}
        >
          {t("today")}
        </button>
        <button
          type="button"
          onClick={() => onSelectDate(tomorrowStr)}
          className={`px-4 py-2.5 min-h-11 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            selectedDate === tomorrowStr
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950"
          }`}
        >
          {t("tomorrow")}
        </button>
        <button
          type="button"
          onClick={() => onSelectDate(dayAfterTomorrowStr)}
          className={`px-4 py-2.5 min-h-11 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            selectedDate === dayAfterTomorrowStr
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950"
          }`}
        >
          {t("dayAfter")}
        </button>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onSelectDate(e.target.value)}
          min={todayStr}
          max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
          className="h-10 text-sm bg-zinc-50 border-zinc-200 rounded-xl font-mono max-w-36"
        />
      </div>
    </div>
  );
}
