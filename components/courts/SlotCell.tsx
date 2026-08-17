"use client";

import { motion } from "framer-motion";
import type { AvailabilitySlot, SlotStatus } from "@/lib/api/courts";

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

interface SlotCellProps {
  slot: AvailabilitySlot;
  isSelected: boolean;
  onSelect: (hour: number) => void;
}

export function SlotCell({ slot, isSelected, onSelect }: SlotCellProps) {
  const isDisabled = slot.status !== "FREE";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      onClick={() => onSelect(slot.hour)}
      className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${slotStyle(
        slot.status,
        isSelected
      )}`}
      aria-label={`${slot.startTime} - ${slotLabel(slot.status)}`}
    >
      <span className="font-semibold tabular-nums">{slot.startTime}</span>
      <span className="text-[11px] opacity-75">{slotLabel(slot.status)}</span>
    </motion.button>
  );
}
