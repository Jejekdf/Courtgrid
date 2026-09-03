"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis";
import { getTranslations } from "next-intl/server";
import { buildCourtSchema, type CreateCourtInput } from "@/features/admin/schemas";
import type { SchemaTranslator } from "@/lib/zod";
import { checkAdmin } from "./auth-guard";

export type AdminCourtRow = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
  imageUrl: string | null;
};

/**
 * Validates court form fields against the Zod schema.
 */
function parseCourtForm(
  formData: FormData,
  t?: SchemaTranslator
): { data: CreateCourtInput | null; error: string | null } {
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    pricePerHour: Number(formData.get("pricePerHour")),
    isActive: formData.get("isActive") === "true",
    imageUrl: (formData.get("imageUrl") as string | null)?.trim() ?? "",
  };

  const schema = buildCourtSchema(t);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }
  return { data: parsed.data, error: null };
}

/**
 * Lists all courts, newest first.
 */
export async function adminGetCourts(): Promise<AdminCourtRow[]> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return [];
  }
  return prisma.court.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, type: true, pricePerHour: true, isActive: true, imageUrl: true },
  });
}

/**
 * Creates a new court from form data.
 */
export async function adminCreateCourt(formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const t = await getTranslations("validation");
  const { data: courtData, error: validationError } = parseCourtForm(formData, t);
  if (validationError || !courtData) {
    return { success: false as const, error: validationError ?? t("courtTypeInvalid") };
  }

  try {
    const venue = await prisma.venue.findFirst();
    if (!venue) {
      return { success: false as const, error: t("venueNotRegistered") };
    }

    await prisma.court.create({
      data: {
        name: courtData.name,
        type: courtData.type,
        pricePerHour: courtData.pricePerHour,
        isActive: courtData.isActive,
        imageUrl: courtData.imageUrl || null,
        venue: { connect: { id: venue.id } },
      },
    });
    await invalidateCache("admin:dashboard:stats");
    revalidatePath("/admin/courts");
    revalidatePath("/courts");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    console.error("Error creating court:", error);
    return { success: false as const, error: t("courtCreateFailed") };
  }
}

/**
 * Updates an existing court by ID.
 */
export async function adminUpdateCourt(id: string, formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const t = await getTranslations("validation");
  const { data: courtData, error: validationError } = parseCourtForm(formData, t);
  if (validationError || !courtData) {
    return { success: false as const, error: validationError ?? t("courtTypeInvalid") };
  }

  try {
    await prisma.court.update({
      where: { id },
      data: {
        name: courtData.name,
        type: courtData.type,
        pricePerHour: courtData.pricePerHour,
        isActive: courtData.isActive,
        imageUrl: courtData.imageUrl || null,
      },
    });
    revalidatePath("/admin/courts");
    revalidatePath("/courts");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    console.error("Error updating court:", error);
    return { success: false as const, error: t("courtUpdateFailed") };
  }
}

/**
 * Deletes a court by ID.
 */
export async function adminDeleteCourt(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  await prisma.court.delete({ where: { id } });
  revalidatePath("/admin/courts");
  revalidatePath("/courts");
  revalidatePath("/");
  return { success: true as const };
}

/**
 * Toggles whether a court is listed as active.
 */
export async function adminToggleCourtActive(id: string, formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const isActive = formData.get("isActive") === "true";
  await prisma.court.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/courts");
  revalidatePath("/courts");
  revalidatePath("/");
  return { success: true };
}
