import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";
import { getJakartaNow } from "@/lib/timezone";

export type CourtDTO = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
};

export type SlotStatus = "PAST" | "BOOKED" | "FREE";

export type AvailabilitySlotDTO = {
  hour: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
};

const SLOT_START_HOUR = 8;
const SLOT_COUNT = 14;
const ALL_HOURS = Array.from({ length: SLOT_COUNT }, (_, i) => SLOT_START_HOUR + i);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtTime(h: number): string {
  return `${pad2(h)}:00`;
}

import { getOrSetCache } from "@/lib/redis";

/**
 * Data Access Layer: Get active courts with React cache() & Redis caching to prevent duplicate queries
 */
export const getActiveCourtsDAL = cache(async (): Promise<CourtDTO[]> => {
  return getOrSetCache("courts:active", async () => {
    const courts = await prisma.court.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        pricePerHour: true,
        isActive: true,
      },
    });

    return courts as CourtDTO[];
  }, 600); // Cache for 10 minutes
});

/**
 * Data Access Layer: Generate full 14-slot availability grid for a court+date.
 *
 * Always returns exactly 14 slots (08:00–21:00). Each slot is classified:
 *   PAST  — hour ≤ current Jakarta hour and date is today
 *   BOOKED — overlaps a PENDING/DP_PAID/DONE reservation
 *   FREE  — all others
 *
 * Ghost-cancel (PAY-3) runs before the query so released slots appear FREE.
 */
export const getCourtAvailabilityDAL = cache(
  async (courtId: string, dateStr: string): Promise<AvailabilitySlotDTO[]> => {
    const { dateStr: todayStr, hour: currentHour } = getJakartaNow();
    const isToday = dateStr === todayStr;

    // Ghost-booking cleanup (PAY-3, FIX-H4): single owner rule
    await autoCancelGhostBookings();

    // Parse date as UTC midnight — Prisma will compare against stored timestamptz
    const date = new Date(dateStr + "T00:00:00.000Z");

    const reservations = await prisma.reservation.findMany({
      where: {
        courtId,
        date,
        status: { in: ["PENDING", "DP_PAID", "DONE"] },
      },
      select: {
        startTime: true,
        status: true,
      },
    });

    // Index reservations by start hour (extracted from stored UTC DateTime)
    const bookedByHour = new Map<number, string>();
    for (const r of reservations) {
      const h = r.startTime.getUTCHours();
      bookedByHour.set(h, r.status);
    }

    // Build deterministic 14-slot grid
    return ALL_HOURS.map((hour): AvailabilitySlotDTO => {
      let status: SlotStatus;
      if (isToday && hour <= currentHour) {
        status = "PAST";
      } else if (bookedByHour.has(hour)) {
        status = "BOOKED";
      } else {
        status = "FREE";
      }

      return {
        hour,
        startTime: fmtTime(hour),
        endTime: fmtTime(hour + 1),
        status,
      };
    });
  }
);
