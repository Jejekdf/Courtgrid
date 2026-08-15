"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getJakartaNow, jakartaDayBounds, jakartaMonthBounds, formatSlotHour } from "@/lib/timezone";
import { z } from "zod";
import { invalidateCache } from "@/lib/redis";
import { getAdminDashboardStatsDAL, type AdminStatsDTO } from "@/features/admin/dal";



/**
 * Verifies that the current session belongs to an admin user.
 *
 * Returns a typed success object instead of throwing to allow server actions
 * to return controlled `{ success: false, error }` responses.
 *
 * @returns Admin check result.
 */
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false as const, error: "Unauthorized. Admins only." };
  }

  return { success: true as const };
}

const courtFormSchema = z.object({
  name: z.string().min(1, "Nama lapangan wajib diisi.").max(60, "Nama lapangan terlalu panjang."),
  type: z.enum(["FUTSAL", "BADMINTON"], "Tipe lapangan tidak valid."),
  pricePerHour: z.number().int().positive("Harga per jam harus berupa angka lebih dari 0."),
  isActive: z.boolean(),
  imageUrl: z.string().max(500, "URL gambar terlalu panjang.").optional().or(z.literal("")),
});

type CourtFormInput = z.infer<typeof courtFormSchema>;

/**
 * Parses and validates the court form (SEC-8: all server inputs go through Zod).
 */
function parseCourtForm(formData: FormData): { data: CourtFormInput | null; error: string | null } {
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    pricePerHour: Number(formData.get("pricePerHour")),
    isActive: formData.get("isActive") === "true",
    imageUrl: (formData.get("imageUrl") as string | null)?.trim() ?? "",
  };

  const parsed = courtFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }
  return { data: parsed.data, error: null };
}




/**
 * Returns paginated admin reservations with optional daily or monthly filtering.
 *
 * Filters apply to reservation `startTime`. The response shape is intentionally
 * paginated so the client can render table navigation without re-fetching all rows.
 *
 * @param filter - Time range filter applied to reservations.
 * @param page - Current page number, starting at 1.
 * @param pageSize - Number of reservations per page.
 * @returns Paginated reservations metadata and rows.
 */
export async function getAllReservations(
  filter: "daily" | "monthly" | "all" = "all",
  page: number = 1,
  pageSize: number = 10,
) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, reservations: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }

  let dateFilter = {};

  if (filter === "daily") {
    // DM-2 / RFC-018: day boundary must be Asia/Jakarta, not server-local TZ.
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
 *
 * @param id - Reservation ID.
 * @returns Success indicator.
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
 * Lists all courts ordered by newest first.
 *
 * @returns Lightweight court records used by admin management UI.
 */
export async function adminGetCourts() {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return [];
  }
  return prisma.court.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, type: true, pricePerHour: true, isActive: true, imageUrl: true } });
}

/**
 * Creates a new court record from form data.
 *
 * @param formData - Multipart form with court fields.
 * @returns Success result or admin auth validation error.
 */
export async function adminCreateCourt(formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const { data: courtData, error: validationError } = parseCourtForm(formData);
  if (validationError || !courtData) {
    return { success: false as const, error: validationError ?? "Data lapangan tidak valid." };
  }

  try {
    const venue = await prisma.venue.findFirst();
    if (!venue) {
      return { success: false as const, error: "Venue belum terdaftar. Tambahkan Venue terlebih dahulu." };
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
    return { success: false as const, error: "Terjadi kesalahan server saat menambah lapangan." };
  }
}

/**
 * Updates an existing court record by ID.
 *
 * @param id - Target court ID.
 * @param formData - Multipart form with updated court fields.
 * @returns Success result or admin auth validation error.
 */
export async function adminUpdateCourt(id: string, formData: FormData) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const { data: courtData, error: validationError } = parseCourtForm(formData);
  if (validationError || !courtData) {
    return { success: false as const, error: validationError ?? "Data lapangan tidak valid." };
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
    return { success: false as const, error: "Terjadi kesalahan server saat memperbarui lapangan." };
  }
}

/**
 * Deletes a court record by ID.
 *
 * @param id - Target court ID.
 * @returns Success result or admin auth validation error.
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
 * Toggles the active status of a court.
 *
 * @param id - Target court ID.
 * @param formData - Expects `isActive` field as stringified boolean.
 * @returns Success result or admin auth validation error.
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
 *
 * @param id - Customer user ID.
 * @returns Success result or admin auth validation error.
 */
export async function adminDeleteCustomer(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: "Tidak dapat menghapus satu-satunya akun ADMIN." };
    }
  }
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin/customers");
  return { success: true };
}

/**
 * Toggles a user's role between ADMIN and CUSTOMER.
 *
 * Enforces PRD §3 / SEC-2: exactly ONE Super Admin (no admin-creation UI).
 * Promoting a CUSTOMER to ADMIN is rejected; demoting an ADMIN is allowed
 * only when another ADMIN account would still exist.
 *
 * @param id - Target user ID.
 * @returns Success result with the new role, or an error if the user is not found.
 */
export async function adminToggleUserRole(id: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

  if (user.role === "CUSTOMER") {
    return {
      success: false,
      error: "Tidak diizinkan membuat akun ADMIN baru. Gunakan akun Super Admin yang sudah ada.",
    };
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    return { success: false, error: "Tidak dapat mengganti role satu-satunya akun ADMIN." };
  }

  await prisma.user.update({ where: { id }, data: { role: "CUSTOMER" } });
  revalidatePath("/admin/customers");
  return { success: true, role: "CUSTOMER" as const };
}

/**
 * Returns paginated customers with search support via the admin DAL.
 *
 * @param search - Optional case-insensitive search query.
 * @param page - Page number starting from 1.
 * @param pageSize - Number of customers per page.
 * @returns Paginated customers payload.
 */
export async function getAdminPaginatedCustomersAction(search?: string, page = 1, pageSize = 10) {
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
 * Looks up a reservation by ID for ticket scanning.
 *
 * Returns the reservation with related user, court, and payment data
 * so staff can verify identity and booking details before check-in.
 *
 * @param reservationId - Reservation identifier to scan.
 * @returns Reservation lookup result.
 */
export async function adminScanTicket(reservationId: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
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
      error: "Tiket / ID Reservasi tidak ditemukan di database.",
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
 * Marks a reservation as completed after successful on-site check-in.
 *
 * Prevents check-in for canceled reservations and revalidates affected
 * admin and dashboard caches after status change.
 *
 * @param reservationId - Reservation identifier to check in.
 * @returns Check-in outcome.
 */
export async function adminCheckInReservation(reservationId: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId.trim() },
  });

  if (!reservation) {
    return { success: false, error: "Reservasi tidak ditemukan." };
  }

  if (reservation.status === "CANCELED") {
    return {
      success: false,
      error: "Tiket ini sudah DIBATALKAN dan tidak dapat digunakan.",
    };
  }

  if (reservation.status === "DONE") {
    return {
      success: false,
      error: "Tiket ini sudah digunakan untuk check-in dan berada dalam status SELESAI (DONE).",
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
export async function adminGlobalSearch(query: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return { success: false as const, error: adminCheck.error, reservations: [], courts: [] };
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
export async function adminGetNotifications() {
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
  try {
    const stats = await getAdminDashboardStatsDAL();
    if (!stats) {
      return { success: false, error: "Data statistik belum tersedia." };
    }
    return { success: true, data: stats };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memuat statistik.";
    return { success: false, error: message, unauthorized: /Unauthorized|Forbidden/.test(message) };
  }
}
