"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getJakartaNow, jakartaDayBounds, jakartaMonthBounds, formatSlotHour } from "@/lib/timezone";
import { invalidateCache } from "@/lib/redis";
import { getAdminDashboardStatsDAL, type AdminStatsDTO } from "@/features/admin/dal";

// =======================
// Shared Return Types
// =======================

type AdminReservationRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string; type?: string } | null;
  payment: { dpAmount?: number; status?: string } | null;
};

type PaginatedReservationsResult =
  | { success: false; error: string; reservations: never[]; totalCount: 0; totalPages: 1; currentPage: 1 }
  | { reservations: AdminReservationRow[]; totalCount: number; totalPages: number; currentPage: number };

type AdminCourtRow = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
  imageUrl: string | null;
};

type SearchResultReservation = {
  id: string;
  date: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string } | null;
};

type SearchResultCourt = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  isActive: boolean;
};

type GlobalSearchResult =
  | { success: false; error: string; reservations: never[]; courts: never[] }
  | { success: true; reservations: (SearchResultReservation & { date: string })[]; courts: SearchResultCourt[] };

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  link: string;
};

type NotificationsResult =
  | { success: false; notifications: never[] }
  | { success: true; notifications: NotificationItem[] };

type CustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
};

type PaginatedCustomersResult =
  | { success: false; error: string; customers: never[]; totalCount: 0; totalPages: 1; currentPage: 1 }
  | { customers: CustomerRow[]; totalCount: number; totalPages: number; currentPage: number };



import { getTranslations } from "next-intl/server";
import { buildCourtSchema, type CreateCourtInput } from "@/features/admin/schemas";
import type { SchemaTranslator } from "@/lib/zod";

/**
 * Checks that the current session belongs to an admin.
 *
 * Returns a typed failure instead of throwing so server actions can respond
 * with a controlled `{ success: false, error }` object.
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
 * Paginated admin reservations, optionally scoped to today or this month.
 *
 * The payload is paginated so the client table can page without re-fetching everything.
 */
export async function getAllReservations(
  filter: "daily" | "monthly" | "all" = "all",
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedReservationsResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, reservations: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }

  let dateFilter = {};

  if (filter === "daily") {
    // Day boundary must be Asia/Jakarta, not server-local TZ.
    const { start, end } = jakartaDayBounds(getJakartaNow().dateStr);
    dateFilter = { date: { gte: start, lt: end } };
  } else if (filter === "monthly") {
    const { start, end } = jakartaMonthBounds(getJakartaNow().dateStr);
    dateFilter = { date: { gte: start, lt: end } };
  }

  const [totalCount, rawReservations] = await Promise.all([
    prisma.reservation.count({ where: dateFilter }),
    prisma.reservation.findMany({
      where: dateFilter,
      orderBy: { startTime: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        totalPrice: true,
        status: true,
        user: { select: { name: true, email: true } },
        court: { select: { name: true, type: true } },
        payment: { select: { id: true, status: true, dpAmount: true } },
      },
    }),
  ]);

  const reservations = rawReservations.map((r) => ({
    ...r,
    date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
    startTime: formatSlotHour(r.startTime),
    endTime: formatSlotHour(r.endTime),
  }));

  return {
    reservations,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    currentPage: page,
  };
}

/**
 * Hard-deletes a reservation by ID.
 */
export async function adminDeleteReservation(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  await prisma.reservation.delete({
    where: { id },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  return { success: true };
}

// =======================
// Courts CRUD
// =======================

/**
 * Lists all courts, newest first.
 */
export async function adminGetCourts(): Promise<AdminCourtRow[]> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return [];
  }
  return prisma.court.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, type: true, pricePerHour: true, isActive: true, imageUrl: true } });
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
  return { success: true };
}


/**
 * Permanently deletes a customer account.
 */
export async function adminDeleteCustomer(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: t("onlyAdminDelete") };
    }
  }
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin/customers");
  return { success: true };
}

/**
 * Swaps a user's role between ADMIN and CUSTOMER.
 *
 * Only demotion is supported: exactly one Super Admin must always remain, and
 * there is no UI to promote a customer. Demotion is allowed only while another
 * admin would still exist.
 */
export async function adminToggleUserRole(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return { success: false, error: t("userNotFound") };

  if (user.role === "CUSTOMER") {
    return {
      success: false,
      error: t("adminCreateNotAllowed"),
    };
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    return { success: false, error: t("onlyAdminRoleSwap") };
  }

  await prisma.user.update({ where: { id }, data: { role: "CUSTOMER" } });
  revalidatePath("/admin/customers");
  return { success: true, role: "CUSTOMER" as const };
}

/**
 * Paginated customers with optional name/email search.
 */
export async function getAdminPaginatedCustomersAction(search?: string, page = 1, pageSize = 10): Promise<PaginatedCustomersResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, customers: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
  const { getAdminPaginatedCustomersDAL } = await import("@/features/admin/dal");
  return getAdminPaginatedCustomersDAL(search, page, pageSize);
}

// =======================
// QR Ticket Scan & Check-in Verification
// =======================

/**
 * Looks up a reservation by ID for ticket scanning, with user/court/payment
 * details so staff can verify identity and booking before check-in.
 */
export async function adminScanTicket(reservationId: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const res = await prisma.reservation.findUnique({
    where: { id: reservationId.trim() },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      totalPrice: true,
      status: true,
      user: { select: { name: true, email: true } },
      court: { select: { name: true, type: true } },
      payment: { select: { dpAmount: true, status: true } },
    },
  });

  if (!res) {
    return {
      success: false,
      error: t("ticketNotFound"),
    };
  }

  return {
    success: true,
    reservation: {
      id: res.id,
      date: res.date instanceof Date ? res.date.toISOString() : String(res.date),
      startTime: formatSlotHour(res.startTime),
      endTime: formatSlotHour(res.endTime),
      totalPrice: res.totalPrice,
      status: res.status,
      user: res.user,
      court: res.court,
      payment: res.payment ? { dpAmount: res.payment.dpAmount, status: res.payment.status } : null,
    },
  };
}

/**
 * Marks a reservation as DONE after on-site check-in.
 *
 * Rejects canceled reservations and revalidates the affected caches.
 */
export async function adminCheckInReservation(reservationId: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const t = await getTranslations("validation");
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId.trim() },
  });

  if (!reservation) {
    return { success: false, error: t("reservationNotFound") };
  }

  if (reservation.status === "CANCELED") {
    return {
      success: false,
      error: t("ticketCanceled"),
    };
  }

  if (reservation.status === "DONE") {
    return {
      success: false,
      error: t("ticketAlreadyUsed"),
    };
  }

  await prisma.reservation.update({
    where: { id: reservationId.trim() },
    data: { status: "DONE" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Check-in E-Ticket berhasil! Status reservasi ${reservationId.slice(0, 8)} diubah menjadi SELESAI (DONE).`,
  };
}
export async function adminGlobalSearch(query: string): Promise<GlobalSearchResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, reservations: [], courts: [] };
  }

  const { checkRateLimitRelaxed } = await import("@/lib/ratelimit");
  const session = await auth();
  const { success: allowed } = await checkRateLimitRelaxed(`admin_search:${session?.user?.id || "anon"}`);
  if (!allowed) {
    return { success: true as const, reservations: [], courts: [] };
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { success: true as const, reservations: [], courts: [] };
  }

  const [reservations, courts] = await Promise.all([
    prisma.reservation.findMany({
      take: 5,
      where: {
        OR: [
          { id: { contains: cleanQuery, mode: "insensitive" } },
          { user: { name: { contains: cleanQuery, mode: "insensitive" } } },
          { user: { email: { contains: cleanQuery, mode: "insensitive" } } },
          { court: { name: { contains: cleanQuery, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        date: true,
        totalPrice: true,
        status: true,
        user: { select: { name: true, email: true } },
        court: { select: { name: true } },
      },
    }),
    prisma.court.findMany({
      take: 5,
      where: {
        name: { contains: cleanQuery, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        type: true,
        pricePerHour: true,
        isActive: true,
      },
    }),
  ]);

  return {
    success: true as const,
    reservations: reservations.map((r) => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
    })),
    courts,
  };
}

/**
 * Fetch Notifications for Admin Topbar
 * Returns latest pending reservations and stats requiring attention.
 */
export async function adminGetNotifications(): Promise<NotificationsResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, notifications: [] };
  }

  const pendingReservations = await prisma.reservation.findMany({
    take: 5,
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,
      user: { select: { name: true } },
      court: { select: { name: true } },
    },
  });

  const notifications = pendingReservations.map((r) => ({
    id: r.id,
    title: "Booking Baru (PENDING)",
    message: `${r.user?.name || "Pelanggan"} memesan ${r.court?.name || "Lapangan"}`,
    time: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    link: "/admin/reservations",
  }));

  return { success: true as const, notifications };
}


export type AdminStatsActionResult =
  | { success: true; data: AdminStatsDTO }
  | { success: false; error: string; unauthorized?: boolean };

export async function getAdminStatsAction(): Promise<AdminStatsActionResult> {
  const t = await getTranslations("validation");
  try {
    const stats = await getAdminDashboardStatsDAL();
    if (!stats) {
      return { success: false, error: t("statsNotReady") };
    }
    return { success: true, data: stats };
  } catch (error) {
    const message = error instanceof Error ? error.message : t("statsNotReady");
    return { success: false, error: message, unauthorized: /Unauthorized|Forbidden/.test(message) };
  }
}
