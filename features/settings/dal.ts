import 'server-only';

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/features/admin/dal";

export type SettingsDTO = {
  id: number;
  venueName: string;
  operationalHours: string;
  contactPhone: string;
  dpPercentage: number;
  autoCancelTimeout: number;
  notifyEmail: string;
};

/**
 * The single global settings row. Admin-only.
 */
export const getSettingsDAL = cache(async (): Promise<SettingsDTO | null> => {
  await verifyAdminSession();

  const s = await prisma.setting.findFirst();
  if (!s) {
    return null;
  }

  return {
    id: s.id,
    venueName: s.venueName,
    operationalHours: s.operationalHours,
    contactPhone: s.contactPhone,
    dpPercentage: s.dpPercentage,
    autoCancelTimeout: s.autoCancelTimeout,
    notifyEmail: s.notifyEmail,
  };
});