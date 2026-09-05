"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { AvailabilitySlot, SlotStatus } from "@/lib/api/courts";

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
  const t = useTranslations("courts");
  const isDisabled = slot.status !== "FREE";

  const statusLabel =
    slot.status === "PAST"
      ? t("slotPast")
      : slot.status === "BOOKED"
        ? t("slotBooked")
        : t("slotFree");

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      onClick={() => onSelect(slot.hour)}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors min-h-11 sm:min-h-12 active:scale-[0.97] motion-reduce:transition-none ${slotStyle(
        slot.status,
        isSelected
      )}`}
      aria-label={`${slot.startTime} - ${statusLabel}`}
    >
      <span className="font-bold tabular-nums font-sans leading-none">{slot.startTime}</span>
      <span className="text-[0.6875rem] opacity-80 leading-none">{statusLabel}</span>
    </motion.button>
  );
}
