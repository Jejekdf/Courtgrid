"use server";

import { prisma } from "@/lib/prisma";
import { getActiveCourtsDAL, ActiveCourtDTO } from "@/features/courts/dal";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";
import { formatSlotHour } from "@/lib/timezone";
import { auth } from "@/auth";
import { uploadCourtImage } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";


/**
 * Returns all active courts sorted by name.
 *
 * @returns Active court records or an empty array on failure.
 */
export async function getCourts(): Promise<ActiveCourtDTO[]> {
  try {
    return await getActiveCourtsDAL("", null);
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
type AvailabilitySlot = { startTime: string; endTime: string; status: string };

export async function getCourtAvailability(courtId: string, dateStr: string): Promise<AvailabilitySlot[]> {
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
      startTime: formatSlotHour(slot.startTime),
      endTime: formatSlotHour(slot.endTime),
      status: slot.status,
    }));
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}



export async function uploadCourtImageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses khusus Superadmin." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Pilih file gambar untuk diupload." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File harus format gambar (JPG/PNG/WEBP)." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Ukuran file maksimal 5MB." };
  }

  try {
    const url = await uploadCourtImage(file);
    revalidatePath("/admin/courts");
    revalidatePath("/courts");
    return { success: true, url, message: "Gambar lapangan berhasil diupload." };
  } catch (err) {
    console.error("Court image upload error:", err);
    return { success: false, error: "Gagal mengupload file gambar." };
  }
}
