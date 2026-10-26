"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

/**
 * Checks that the current session belongs to an admin.
 */
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    const t = await getTranslations("validation");
    return { success: false as const, error: t("unauthorizedAdmin") };
  }

  return { success: true as const };
}

/**
 * Updates (or creates) the global venue settings record.
 *
 * Admin-only. Revalidates the settings, admin dashboard, and public home
 * pages so the UI reflects new values immediately.
 */
export async function updateAdminSettings(formData: FormData) {
  const t = await getTranslations("validation");
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.success) {
      return { success: false, error: adminCheck.error };
    }

    // Validate ranges via Zod (invalid values must be rejected).
    const settingsSchema = z.object({
      venueName: z.string().min(1, t("venueNameRequired")).max(100, t("venueNameTooLong")),
      operationalHours: z.string().min(1, t("operatingHoursRequired")).max(100, t("operatingHoursTooLong")),
      contactPhone: z.string().max(30, t("contactPhoneTooLong")).optional(),
      dpPercentage: z.number().int().min(10, t("dpPercentageRange")).max(100, t("dpPercentageRange")),
      autoCancelTimeout: z.number().int().min(5, t("autoCancelTimeoutRange")).max(120, t("autoCancelTimeoutRange")),
      notifyEmail: z.email(t("notificationEmailInvalid")).optional().or(z.literal("")),
    });

    const parsed = settingsSchema.safeParse({
      venueName: formData.get("venueName"),
      operationalHours: formData.get("operationalHours"),
      contactPhone: formData.get("contactPhone") || "",
      dpPercentage: Number(formData.get("dpPercentage")),
      autoCancelTimeout: Number(formData.get("autoCancelTimeout")),
      notifyEmail: formData.get("notifyEmail") || "",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { venueName, operationalHours, contactPhone, dpPercentage, autoCancelTimeout, notifyEmail } = parsed.data;

    // --- SAVE TO DATABASE ---
    // Upsert: update if the settings row exists, create it otherwise.
    await prisma.setting.upsert({
      where: { id: 1 },
      update: {
        venueName,
        operationalHours,
        contactPhone: contactPhone || undefined,
        dpPercentage,
        autoCancelTimeout,
        notifyEmail: notifyEmail || undefined,
      },
      create: {
        id: 1,
        venueName,
        operationalHours,
        contactPhone: contactPhone || "",
        dpPercentage,
        autoCancelTimeout,
        notifyEmail: notifyEmail || "",
      },
    });

    // Clear the Next.js cache so the UI reflects changes immediately.
    const { invalidateCache } = await import("@/lib/redis");
    await invalidateCache("admin:dashboard:stats");

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/dashboard/book");
    revalidatePath("/");

    return {
      success: true,
      message: t("settingsUpdateSuccess"),
    };

  } catch (error) {
    console.error("Gagal menyimpan pengaturan:", error);
    return {
      success: false,
      error: t("settingsUpdateFailed"),
    };
  }
}

/**
 * Fetches the current global venue settings. Admin-only.
 */
export async function getSettingsAction() {
  const t = await getTranslations("validation");
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.success) {
      return { success: false, error: adminCheck.error };
    }
    const { getSettingsDAL } = await import("@/features/settings/dal");
    const settings = await getSettingsDAL();
    if (!settings) {
      return { success: false, error: t("settingsNotInitialized") };
    }
    return { success: true, data: settings };
  } catch {
    return { success: false, error: t("settingsLoadFailed") };
  }
}
