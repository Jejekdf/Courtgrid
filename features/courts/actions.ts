"use server";

import { prisma } from "@/lib/prisma";
import { getActiveCourtsDAL, ActiveCourtDTO } from "@/features/courts/dal";
import { autoCancelGhostBookings } from "@/features/reservations/ghostCancel";
import { formatSlotHour } from "@/lib/timezone";
import { auth } from "@/auth";
import { uploadCourtImage } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";


/**
 * All active courts, sorted by name. Returns an empty array on failure.
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
 * Booked time slots for a court on a given date.
 *
 * Runs the ghost-booking cleanup first so stale, unpaid PENDING reservations
 * (older than `Setting.autoCancelTimeout`, no Stripe session) release their slots.
 */
type AvailabilitySlot = { startTime: string; endTime: string; status: string };

export async function getCourtAvailability(courtId: string, dateStr: string): Promise<AvailabilitySlot[]> {
  try {
    const { getRedisClient, getOrSetCache } = await import("@/lib/redis");
    const redis = getRedisClient();
    let shouldRunCancel = true;
    if (redis) {
      try {
        const acquired = await redis.set("ghost-cancel:last-run", "1", { nx: true, ex: 300 });
        shouldRunCancel = acquired === "OK";
      } catch {
        shouldRunCancel = true;
      }
    }
    if (shouldRunCancel) {
      await autoCancelGhostBookings();
    }

    return await getOrSetCache(
      `public:avail:raw:${courtId}:${dateStr}`,
      async () => {
        const date = new Date(`${dateStr}T00:00:00.000Z`);
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
      },
      60
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}



export async function uploadCourtImageAction(formData: FormData) {
  const t = await getTranslations("validation");
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: t("unauthorizedAdmin") };
  }

  const { checkRateLimitRelaxed } = await import("@/lib/ratelimit");
  const { success: allowed } = await checkRateLimitRelaxed(`court_img:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: t("courtUploadRateLimit") };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: t("courtImageRequired") };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: t("imageInvalidType") };
  }

  if (file.size > 3 * 1024 * 1024) {
    return { success: false, error: t("imageTooLarge") };
  }

  try {
    const url = await uploadCourtImage(file);
    revalidatePath("/admin/courts");
    revalidatePath("/courts");
    return { success: true, url, message: t("courtImageSuccess") };
  } catch (err) {
    console.error("Court image upload error:", err);
    return { success: false, error: t("avatarUploadFailed") };
  }
}
