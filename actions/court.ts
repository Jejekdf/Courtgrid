"use server";

import { prisma } from "@/lib/prisma";

export async function getCourts() {
  try {
    const courts = await prisma.court.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return courts;
  } catch (error) {
    console.error("Error fetching courts:", error);
    return [];
  }
}

export async function getCourtAvailability(courtId: string, dateStr: string) {
  try {
    const date = new Date(dateStr);
    const reservations = await prisma.reservation.findMany({
      where: {
        courtId,
        date,
        status: {
          in: ["PENDING", "DP_PAID", "DONE"],
        },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });
    return reservations;
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}
