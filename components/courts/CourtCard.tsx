"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Court } from "@/lib/api/courts";
import AvailabilityGrid from "./AvailabilityGrid";

export default function CourtCard({
  court,
  priority = false,
}: {
  court: Court;
  priority?: boolean;
}) {
  const [showAvailability, setShowAvailability] = useState(false);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl shadow-xs overflow-hidden flex flex-col hover:border-zinc-300 transition-[border-color,box-shadow]">
      <div className="relative h-48 bg-zinc-100 border-b border-zinc-200/80 overflow-hidden">
        {court.imageUrl ? (
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 hover-fine:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs font-mono text-zinc-400">
            Foto Arena CourtGrid
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-950/90 text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border border-zinc-700 shadow-xs flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{court.type}</span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-zinc-950">{court.name}</h3>
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400 font-mono">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            {court.venue?.name || "GOR CourtGrid Arena"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-sm text-zinc-400 font-mono">Tarif Per Jam</span>
          <span className="font-extrabold text-zinc-950 font-mono text-sm">
            Rp {court.pricePerHour.toLocaleString("id-ID")}
          </span>
        </div>

        <button
          onClick={() => setShowAvailability((v) => !v)}
          className="flex items-center justify-center gap-2 w-full min-h-11 py-2.5 text-sm font-bold font-mono text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <span>{showAvailability ? "Sembunyikan Jadwal" : "Cek Ketersediaan Jam"}</span>
          <motion.span
            animate={{ rotate: showAvailability ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {showAvailability && (
          <motion.div
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