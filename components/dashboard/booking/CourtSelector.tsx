"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Court } from "@/components/dashboard/CustomerBookingWorkspace";

interface CourtSelectorProps {
  courts: Court[];
  activeCourt: Court | null;
  onSelectCourt: (court: Court) => void;
}

export function CourtSelector({
  courts,
  activeCourt,
  onSelectCourt,
}: CourtSelectorProps) {
  const t = useTranslations("dashboard.bookingFlow");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          {t("step1")}
        </h3>
        <span className="text-sm text-zinc-500 font-mono">
          {t("activeArenas", { count: courts.length })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courts.map((court) => {
          const isSelected = activeCourt?.id === court.id;

          return (
            <button
              type="button"
              key={court.id}
              onClick={() => onSelectCourt(court)}
              className={`group relative p-5 rounded-2xl border transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                isSelected
                  ? "border-zinc-950 bg-white shadow-md ring-2 ring-zinc-950/10"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-950 text-white rounded-full text-[0.6875rem] font-mono font-bold flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("selectedBadge")}</span>
                </div>
              )}

              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 text-[0.6875rem] font-mono font-bold uppercase tracking-wider rounded-md">
                  {court.type}
                </span>
                <h4 className="font-extrabold text-zinc-950 text-lg group-hover:text-emerald-700 transition-colors">
                  {court.name}
                </h4>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between w-full">
                <span className="text-sm text-zinc-500 font-mono">{t("perHour")}</span>
                <span className="text-base font-extrabold text-zinc-950">
                  Rp {court.pricePerHour.toLocaleString("id-ID")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
