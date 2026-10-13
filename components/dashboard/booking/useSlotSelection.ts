"use client";

import { useState, useMemo, useCallback } from "react";
import { getJakartaNow } from "@/lib/timezone";

export type SlotStatus = "AVAILABLE" | "PENDING" | "DP_PAID" | "PAST" | "UNAVAILABLE";

interface AvailabilityItem {
  startTime: string;
  endTime: string;
  status: string;
}

interface UseSlotSelectionProps {
  selectedDate: string;
  availability: AvailabilityItem[];
  initialSlots?: string[];
}

export function useSlotSelection({
  selectedDate,
  availability,
  initialSlots = [],
}: UseSlotSelectionProps) {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(initialSlots);

  const isContiguous = useMemo(() => {
    if (selectedTimeSlots.length <= 1) return true;
    const sorted = [...selectedTimeSlots].sort();
    const startHour = parseInt(sorted[0].split(":")[0], 10);
    const endHour = parseInt(sorted[sorted.length - 1].split(":")[0], 10) + 1;
    return endHour - startHour === sorted.length;
  }, [selectedTimeSlots]);

  const getSlotStatus = useMemo(() => {
    const { dateStr: todayStr, hour: currentHour } = getJakartaNow();

    return (time: string): SlotStatus => {
      const tHour = parseInt(time.split(":")[0], 10);

      if (selectedDate === todayStr && tHour <= currentHour) {
        return "PAST";
      }

      const slot = availability.find((res) => {
        const sHour = parseInt(res.startTime.split(":")[0], 10);
        const eHour = parseInt(res.endTime.split(":")[0], 10);
        return tHour >= sHour && tHour < eHour;
      });

      if (!slot) return "AVAILABLE";
      return slot.status as SlotStatus;
    };
  }, [availability, selectedDate]);

  const toggleTimeSlot = useCallback(
    (time: string, onClearVoucher?: () => void) => {
      setSelectedTimeSlots((prev) => {
        if (prev.includes(time)) {
          const remaining = prev.filter((t) => t !== time);
          if (remaining.length === 0 && onClearVoucher) {
            onClearVoucher();
          }
          return remaining;
        }

        if (prev.length === 0) {
          return [time];
        }

        const clickedHour = parseInt(time.split(":")[0], 10);
        const hours = prev.map((t) => parseInt(t.split(":")[0], 10)).sort((a, b) => a - b);
        const minHour = hours[0];
        const maxHour = hours[hours.length - 1];

        // Auto-fill forward range if all intermediate slots are available
        if (clickedHour > maxHour) {
          const intermediateSlots: string[] = [];
          let allAvailable = true;
          for (let h = minHour; h <= clickedHour; h++) {
            const slotStr = `${h.toString().padStart(2, "0")}:00`;
            if (getSlotStatus(slotStr) !== "AVAILABLE") {
              allAvailable = false;
              break;
            }
            intermediateSlots.push(slotStr);
          }

          if (allAvailable) {
            return intermediateSlots;
          }
        } else if (clickedHour < minHour) {
          // Auto-fill backward range if all intermediate slots are available
          const intermediateSlots: string[] = [];
          let allAvailable = true;
          for (let h = clickedHour; h <= maxHour; h++) {
            const slotStr = `${h.toString().padStart(2, "0")}:00`;
            if (getSlotStatus(slotStr) !== "AVAILABLE") {
              allAvailable = false;
              break;
            }
            intermediateSlots.push(slotStr);
          }

          if (allAvailable) {
            return intermediateSlots;
          }
        }

        return [...prev, time].sort();
      });
    },
    [getSlotStatus]
  );

  const clearSlots = useCallback(() => {
    setSelectedTimeSlots([]);
  }, []);

  return {
    selectedTimeSlots,
    setSelectedTimeSlots,
    getSlotStatus,
    toggleTimeSlot,
    isContiguous,
    clearSlots,
  };
}
