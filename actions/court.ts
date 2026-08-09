"use server";

import { prisma } from "@/lib/prisma";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";

/**
 * Converts a Date to localized HH:mm time string.
 */
const formatTime = (date: Date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

/**
 * Returns all active courts sorted by name.
 *
 * @returns Active court records or an empty array on failure.
 */
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

/**
 * Returns booked time slots for a court on a specific date.
 *
 * Delegates ghost-booking cleanup to `autoCancelGhostBookings()` (PAY-3, FIX-H4):
 * cancels stale PENDING reservations older than `Setting.autoCancelTimeout`
 * (default 15 min) that have no attached Stripe session.
 *
 * @param courtId - Court identifier.
 * @param dateStr - ISO date string for the requested day.
 * @returns Array of time slots with status metadata.
 */
export async function getCourtAvailability(courtId: string, dateStr: string) {
  try {
    const date = new Date(dateStr);

    // Ghost-booking cleanup (PAY-3, FIX-H4): single owner rule
    await autoCancelGhostBookings();

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
    return reservations.map((slot) => ({
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
      status: slot.status,
    }));
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}
