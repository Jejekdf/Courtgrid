"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Court } from "@/lib/api/courts";
import AvailabilityGrid from "./AvailabilityGrid";

export default function CourtCard({ court }: { court: Court }) {
  const [showAvailability, setShowAvailability] = useState(false);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-44 bg-zinc-100 border-b border-zinc-200 overflow-hidden">
        {court.imageUrl ? (
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-zinc-400">
            Tidak ada gambar
          </div>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 text-zinc-950 border border-zinc-200">
          {court.type}
        </span>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-950">{court.name}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="w-3.5 h-3.5" />
              {court.venue.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">Harga/jam</span>
          <span className="font-semibold text-zinc-950">
            Rp {court.pricePerHour.toLocaleString("id-ID")}
          </span>
        </div>

        <button
          onClick={() => setShowAvailability((v) => !v)}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          Lihat Ketersediaan
          <motion.span
            animate={{ rotate: showAvailability ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {showAvailability && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-zinc-100"
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