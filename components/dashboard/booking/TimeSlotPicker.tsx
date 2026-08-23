"use client";

import { Clock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface TimeSlotPickerProps {
  courtName: string;
  timeSlots: string[];
  selectedTimeSlots: string[];
  isLoadingAvailability: boolean;
  getSlotStatus: (
    time: string
  ) => "AVAILABLE" | "PENDING" | "DP_PAID" | "PAST" | "UNAVAILABLE";
  onToggleSlot: (time: string) => void;
}

export function TimeSlotPicker({
  courtName,
  timeSlots,
  selectedTimeSlots,
  isLoadingAvailability,
  getSlotStatus,
  onToggleSlot,
}: TimeSlotPickerProps) {
  const t = useTranslations("dashboard.bookingFlow");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
          <Clock className="size-4 text-zinc-600" />
          {t("step2", { court: courtName })}
        </h3>

        {/* Status Legend */}
        <div className="flex items-center gap-3 text-[0.6875rem] font-semibold text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-white border border-zinc-300"></span>{" "}
            {t("legendFree")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-emerald-600"></span> {t("legendSelected")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-amber-100 border border-amber-300"></span>{" "}
            {t("legendTaken")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-zinc-200 opacity-60"></span>{" "}
            {t("legendPast")}
          </span>
        </div>
      </div>

      {isLoadingAvailability ? (
        <div className="py-20 flex flex-col items-center justify-center bg-zinc-50/50 rounded-2xl border border-zinc-200 border-dashed space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-400 font-mono">
            Mengecek jadwal jam main...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {timeSlots.map((time) => {
            const status = getSlotStatus(time);
            const isAvailable = status === "AVAILABLE";
            const isPast = status === "PAST";
            const isSelected = selectedTimeSlots.includes(time);

            let btnClasses =
              "h-14 rounded-xl text-sm font-bold transition-colors duration-150 flex flex-col items-center justify-center select-none cursor-pointer ";

            if (isPast) {
              btnClasses +=
                "bg-zinc-100 text-zinc-400 border border-zinc-200/80 cursor-not-allowed opacity-50 line-through";
            } else if (status === "PENDING" || status === "DP_PAID") {
              btnClasses +=
                "bg-amber-50 text-amber-800 border border-amber-200/80 cursor-not-allowed";
            } else if (!isAvailable) {
              btnClasses +=
                "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed line-through opacity-60";
            } else if (isSelected) {
              btnClasses +=
                "bg-zinc-950 text-white shadow-md border-transparent ring-2 ring-zinc-950/20 active:scale-95";
            } else {
              btnClasses +=
                "bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-950 hover:bg-zinc-50 active:scale-95";
            }

            return (
              <button
                key={time}
                type="button"
                disabled={!isAvailable}
                onClick={() => onToggleSlot(time)}
                className={btnClasses}
              >
                <span className="font-mono text-sm">{time}</span>
                <span className="text-[0.6875rem] block leading-tight mt-0.5 font-mono opacity-80">
                  {isPast
                    ? t("legendPast")
                    : isSelected
                    ? t("legendSelected")
                    : status === "PENDING" || status === "DP_PAID"
                    ? t("legendTaken")
                    : t("legendFree")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
