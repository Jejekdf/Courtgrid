import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";

export type CourtDTO = {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  isActive: boolean;
};

export type AvailabilitySlotDTO = {
  startTime: string;
  endTime: string;
  status: string;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

/**
 * Data Access Layer: Get active courts with React cache() to prevent duplicate queries
 */
export const getActiveCourtsDAL = cache(async (): Promise<CourtDTO[]> => {
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
});

/**
 * Data Access Layer: Get court availability for date with ghost-booking cleanup
 */
export const getCourtAvailabilityDAL = cache(
  async (courtId: string, dateStr: string): Promise<AvailabilitySlotDTO[]> => {
    const date = new Date(dateStr);

    // Ghost-booking cleanup (PAY-3, FIX-H4): single owner rule
    await autoCancelGhostBookings();

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

    return reservations.map((slot) => ({
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
      status: slot.status,
    }));
  }
);
