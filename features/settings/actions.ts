"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";



/**
 * Checks that the current session belongs to an admin.
 */
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false as const, error: "Unauthorized. Admins only." };
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
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.success) {
      return { success: false, error: adminCheck.error };
    }

    // Validate ranges via Zod (invalid values must be rejected).
    const settingsSchema = z.object({
      venueName: z.string().min(1, "Nama venue wajib diisi.").max(100),
      operationalHours: z.string().min(1, "Jam operasional wajib diisi.").max(100),
      contactPhone: z.string().max(30, "Nomor telepon terlalu panjang.").optional(),
      dpPercentage: z.number().int().min(1, "Persentase DP minimal 1%.").max(100, "Persentase DP maksimal 100%."),
      autoCancelTimeout: z.number().int().min(1, "Waktu auto-cancel minimal 1 menit.").max(1440, "Waktu auto-cancel maksimal 1440 menit (24 jam)."),
      notifyEmail: z.email("Email notifikasi tidak valid.").optional().or(z.literal("")),
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
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: "Pengaturan sistem berhasil diperbarui dan disimpan!",
    };

  } catch (error) {
    console.error("Gagal menyimpan pengaturan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan server saat mencoba menyimpan data.",
    };
  }
}

/**
 * Fetches the current global venue settings. Admin-only.
 */
export async function getSettingsAction() {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.success) {
      return { success: false, error: adminCheck.error };
    }
    const { getSettingsDAL } = await import("@/features/settings/dal");
    const settings = await getSettingsDAL();
    if (!settings) {
      return { success: false, error: "Pengaturan belum diinisialisasi." };
    }
    return { success: true, data: settings };
  } catch {
    return { success: false, error: "Gagal memuat pengaturan." };
  }
}
