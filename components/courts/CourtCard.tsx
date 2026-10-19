"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MapPin, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import type { Court } from "@/lib/api/courts";
import AvailabilityGrid from "./AvailabilityGrid";
import { formatRupiah } from "@/lib/utils";

export default function CourtCard({
  court,
  priority = false,
  isExpanded,
  onToggleExpand,
}: {
  court: Court;
  priority?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const t = useTranslations("courts");
  const [internalExpanded, setInternalExpanded] = useState(false);
  const showAvailability = isExpanded !== undefined ? isExpanded : internalExpanded;
  const toggleAvailability = onToggleExpand ?? (() => setInternalExpanded((v) => !v));

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col hover:border-zinc-300 transition-[border-color,box-shadow]">
      <div className="relative aspect-16/10 bg-zinc-100 border-b border-zinc-200/80 overflow-hidden">
        {court.imageUrl ? (
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            unoptimized={court.imageUrl.startsWith("http")}
            className="object-cover transition-transform duration-500 hover-fine:scale-105"
            sizes="(min-width: 1440px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs font-medium text-zinc-400">
            {t("cardImageFallback")}
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-950/80 backdrop-blur-xs text-white rounded-lg text-xs font-semibold border border-zinc-700/80 shadow-xs font-sans">
          <span>{court.type}</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col justify-between gap-4 flex-1">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950 text-balance">{court.name}</h3>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 font-sans">
            <MapPin className="size-3.5 text-zinc-400" aria-hidden="true" />
            {court.venue?.name || "GOR CourtGrid Jakarta"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-xs sm:text-sm text-zinc-500 font-sans whitespace-nowrap">{t("perHour")}</span>
          <span className="font-extrabold text-zinc-950 text-sm sm:text-base xl:text-lg tabular-nums whitespace-nowrap">
            {formatRupiah(court.pricePerHour)}
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={`/dashboard/book?courtId=${court.id}`}
            className="flex items-center justify-center gap-1.5 w-full min-h-11 py-2.5 text-sm font-bold font-sans text-white bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] rounded-xl transition-[background-color,transform] shadow-xs cursor-pointer whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20"
          >
            <span>{t("bookCourt")}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            aria-expanded={showAvailability}
            aria-controls={`court-schedule-${court.id}`}
            onClick={toggleAvailability}
            className="flex items-center justify-center gap-1.5 w-full min-h-11 py-2 text-sm font-semibold font-sans text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/70 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{showAvailability ? t("hideSchedule") : t("showSchedule")}</span>
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${showAvailability ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAvailability && (
          <motion.div
            id={`court-schedule-${court.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-zinc-100 bg-zinc-50/50"
          >
            <AvailabilityGrid
              courtId={court.id}
              pricePerHour={court.pricePerHour}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}