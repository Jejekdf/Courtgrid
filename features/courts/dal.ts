import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isCourtType } from "@/lib/api/courts";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";
import { getJakartaNow } from "@/lib/timezone";
import { getRedisClient, getOrSetCache } from "@/lib/redis";

export type CourtDTO = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
};

export type ActiveCourtDTO = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  imageUrl: string | null;
  venue: { name: string };
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

export const getActiveCourtsDAL = cache(
  async (search: string, type: string | null): Promise<ActiveCourtDTO[]> => {
    const cleanSearch = search?.trim().toLowerCase() || "";
    const cleanType = isCourtType(type) ? type : "all";
    const cacheKey = `public:courts:list:${cleanSearch}:${cleanType}`;

    return getOrSetCache(
      cacheKey,
      async () => {
        const courts = await prisma.court.findMany({
          where: {
            isActive: true,
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
            ...(isCourtType(type) ? { type } : {}),
          },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
            imageUrl: true,
            venue: { select: { name: true } },
          },
        });
        return courts as ActiveCourtDTO[];
      },
      300
    );
  }
);

export const checkActiveCourtExistsDAL = cache(
  async (courtId: string): Promise<boolean> => {
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { isActive: true },
    });
    return Boolean(court?.isActive);
  }
);

/**
 * Returns the 14 hourly availability slots from 08:00 to 21:00 for a court and date.
 * Stale unpaid reservations are released beforehand so their slots appear free.
 */
export const getCourtAvailabilityDAL = cache(
  async (courtId: string, dateStr: string): Promise<AvailabilitySlotDTO[]> => {
    const { dateStr: todayStr, hour: currentHour } = getJakartaNow();
    const isToday = dateStr === todayStr;

    const redis = getRedisClient();
    let shouldRunCancel = true;
    if (redis) {
      try {
        const acquired = await redis.set("ghost-cancel:last-run", "1", { nx: true, ex: 300 });
        shouldRunCancel = acquired === "OK";
      } catch (err) {
        console.warn("[Redis ghost-cancel throttle error]", err);
        shouldRunCancel = true;
      }
    }
    if (shouldRunCancel) {
      await autoCancelGhostBookings();
    }

    const date = new Date(dateStr + "T00:00:00.000Z");

    const reservations = await prisma.reservation.findMany({
      where: {
        courtId,
        date,
        status: { in: ["PENDING", "DP_PAID", "DONE"] },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    const bookedByHour = new Map<number, string>();
    for (const r of reservations) {
      const startH = r.startTime.getUTCHours();
      let endH = r.endTime.getUTCHours();
      if (endH === 0 && r.endTime.getUTCDate() !== r.startTime.getUTCDate()) {
        endH = 24;
      }
      for (let h = startH; h < endH; h++) {
        bookedByHour.set(h, r.status);
      }
    }

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
