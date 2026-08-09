"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

// =======================
// Dashboard Statistics
// =======================

/**
 * Aggregates admin dashboard metrics.
 *
 * - Total reservations count
 * - Revenue sum for `DP_PAID` and `DONE` reservations
 * - Total courts count
 * - 5 most recent reservations with related user, court, and payment
 *
 * Intended for the admin dashboard overview page.
 *
 * @throws If the caller is not an admin.
 * @returns Dashboard statistics payload.
 */
export async function getDashboardStats() {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    throw new Error(adminCheck.error);
  }

  const totalReservations = await prisma.reservation.count();

  // Total Revenue (only DP_PAID and DONE)
  const revenueResult = await prisma.reservation.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      status: {
        in: ["DP_PAID", "DONE"],
      },
    },
  });

  const totalCourts = await prisma.court.count();

  const recentReservations = await prisma.reservation.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      court: true,
      payment: true,
    },
  });

  return {
    totalReservations,
    totalRevenue: revenueResult._sum.totalPrice || 0,
    totalCourts,
    recentReservations,
  };
}

// =======================
// Reservations Reporting & Cleanup
// =======================

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
  const today = new Date();

  if (filter === "daily") {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

    dateFilter = { startTime: { gte: startOfDay, lte: endOfDay } };
  } else if (filter === "monthly") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    dateFilter = { startTime: { gte: startOfMonth, lte: endOfMonth } };
  }

  const [totalCount, reservations] = await Promise.all([
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
        payment: true,
      },
    }),
  ]);

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
  const name = formData.get("name") as string;
  const type = formData.get("type") as "FUTSAL" | "BADMINTON";
  const pricePerHour = parseInt(formData.get("pricePerHour") as string, 10);
  const isActive = formData.get("isActive") === "true";
  const imageUrl = (formData.get("imageUrl") as string | null) || null;

  const venue = await prisma.venue.findFirst();
  if (!venue) {
    return { success: false as const, error: "Venue belum terdaftar. Tambahkan Venue terlebih dahulu." };
  }
  const venueId = venue.id;

  await prisma.court.create({
    data: { name, type, pricePerHour, isActive, imageUrl, venue: { connect: { id: venueId } } },
  });
  revalidatePath("/admin/courts");
  return { success: true };
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
  const name = formData.get("name") as string;
  const type = formData.get("type") as "FUTSAL" | "BADMINTON";
  const pricePerHour = parseInt(formData.get("pricePerHour") as string, 10);
  const isActive = formData.get("isActive") === "true";
  const imageUrl = (formData.get("imageUrl") as string | null) || null;

  await prisma.court.update({
    where: { id },
    data: { name, type, pricePerHour, isActive, imageUrl },
  });
  revalidatePath("/admin/courts");

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

// =======================
// Customers Management
// =======================

/**
 * Retrieves all customer users, optionally filtered by search term.
 *
 * Search is case-insensitive across `name` and `email`.
 *
 * @param search - Optional search query.
 * @returns Customer user records.
 */
export async function adminGetCustomers(search?: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return [];
  }
  const whereCondition = search
    ? {
        role: "CUSTOMER" as const,
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { role: "CUSTOMER" as const };

  const customers = await prisma.user.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  return customers;
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
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin/customers");
  return { success: true };
}

/**
 * Toggles a user's role between ADMIN and CUSTOMER.
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

  const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
  await prisma.user.update({ where: { id }, data: { role: newRole } });
  revalidatePath("/admin/customers");
  return { success: true, role: newRole };
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
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId.trim() },
    include: {
      user: { select: { name: true, email: true } },
      court: { select: { name: true, type: true } },
      payment: true,
    },
  });

  if (!reservation) {
    return {
      success: false,
      error: "Tiket / ID Reservasi tidak ditemukan di database.",
    };
  }

  return { success: true, reservation };
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
