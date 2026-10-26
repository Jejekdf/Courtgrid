"use client";

import { useSyncExternalStore } from "react";
import { Clock, Loader2, Globe, AlertCircle } from "lucide-react";
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
  isContiguous?: boolean;
}

function getUserTz(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && !["Asia/Jakarta", "Asia/Pontianak"].includes(tz)) {
      return tz;
    }
  } catch {
    // Ignore detection errors
  }
  return null;
}

const emptySubscribe = () => () => {};

export function TimeSlotPicker({
  courtName,
  timeSlots,
  selectedTimeSlots,
  isLoadingAvailability,
  getSlotStatus,
  onToggleSlot,
  isContiguous = true,
}: TimeSlotPickerProps) {
  const t = useTranslations("dashboard.bookingFlow");
  const userTz = useSyncExternalStore(emptySubscribe, getUserTz, () => null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-zinc-600" aria-hidden="true" />
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 text-balance">
            {t("step2")}
          </h3>
          {courtName && (
            <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200">
              {courtName}
            </span>
          )}
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 font-sans flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-white border border-zinc-300"></span>{" "}
            {t("legendFree")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-zinc-950"></span> {t("legendSelected")}
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

      {userTz && (
        <div className="flex items-center gap-2.5 p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs sm:text-sm text-zinc-600 font-sans">
          <Globe className="size-4 text-zinc-700 shrink-0" aria-hidden="true" />
          <p className="leading-relaxed">
            {t("tzNotice", { tz: userTz })}
          </p>
        </div>
      )}

      {isLoadingAvailability ? (
        <div className="py-16 flex flex-col items-center justify-center bg-zinc-50/50 rounded-2xl border border-zinc-200 border-dashed space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <span className="text-xs sm:text-sm text-zinc-500 font-sans">
            {t("checkingSchedule")}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-2.5 xl:gap-3">
          {timeSlots.map((time) => {
            const status = getSlotStatus(time);
            const isAvailable = status === "AVAILABLE";
            const isPast = status === "PAST";
            const isSelected = selectedTimeSlots.includes(time);

            let btnClasses =
              "h-14 sm:h-15 xl:h-16 rounded-xl font-medium transition-[color,background-color,border-color,transform] duration-150 motion-reduce:transition-none will-change-transform flex flex-col items-center justify-center select-none cursor-pointer min-h-12 ";

            if (isPast) {
              btnClasses +=
                "bg-zinc-100 text-zinc-400 border border-zinc-200/80 cursor-not-allowed opacity-50 line-through";
            } else if (status === "PENDING") {
              btnClasses +=
                "bg-amber-50 text-amber-800 border border-amber-200/90 cursor-not-allowed";
            } else if (status === "DP_PAID") {
              btnClasses +=
                "bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-not-allowed";
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
                <span className="font-bold tabular-nums font-sans text-xs sm:text-sm xl:text-base">{time}</span>
                <span className="text-xs block leading-tight mt-0.5 font-sans opacity-85">
                  {isPast
                    ? t("legendPast")
                    : isSelected
                    ? t("legendSelected")
                    : status === "PENDING"
                    ? t("slotPending")
                    : status === "DP_PAID"
                    ? t("slotBooked")
                    : t("legendFree")}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!isContiguous && selectedTimeSlots.length > 1 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900">
          <AlertCircle className="size-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>{t("nonContiguousWarning")}</span>
        </div>
      )}
    </div>
  );
}
