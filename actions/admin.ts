"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Utility function to check admin role
async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized. Admins only.");
  }
}

// =======================
// Dashboard Statistics
// =======================
export async function getDashboardStats() {
  await checkAdmin();

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
    include: { user: { select: { name: true, email: true } }, court: true, payment: true },
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
export async function getAllReservations(filter: "daily" | "monthly" | "all" = "all") {
  await checkAdmin();

  let dateFilter = {};
  const today = new Date();

  if (filter === "daily") {
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    dateFilter = { date: { gte: startOfDay, lte: endOfDay } };
  } else if (filter === "monthly") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    dateFilter = { date: { gte: startOfMonth, lte: endOfMonth } };
  }

  const reservations = await prisma.reservation.findMany({
    where: dateFilter,
    orderBy: { date: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      court: { select: { name: true } },
      payment: true,
    },
  });

  return reservations;
}

export async function adminDeleteReservation(id: string) {
  await checkAdmin();
  await prisma.reservation.delete({
    where: { id },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  revalidatePath("/schedule");
  return { success: true };
}

// =======================
// Courts CRUD
// =======================
export async function adminGetCourts() {
  await checkAdmin();
  return prisma.court.findMany({ orderBy: { createdAt: "desc" } });
}

export async function adminCreateCourt(formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const type = formData.get("type") as "FUTSAL" | "BADMINTON";
  const pricePerHour = parseInt(formData.get("pricePerHour") as string, 10);
  const isActive = formData.get("isActive") === "true";

  await prisma.court.create({
    data: { name, type, pricePerHour, isActive },
  });
  revalidatePath("/admin/courts");
  revalidatePath("/schedule");
}

export async function adminUpdateCourt(id: string, formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const type = formData.get("type") as "FUTSAL" | "BADMINTON";
  const pricePerHour = parseInt(formData.get("pricePerHour") as string, 10);
  const isActive = formData.get("isActive") === "true";

  await prisma.court.update({
    where: { id },
    data: { name, type, pricePerHour, isActive },
  });
  revalidatePath("/admin/courts");
  revalidatePath("/schedule");
}

export async function adminDeleteCourt(id: string) {
  await checkAdmin();
  await prisma.court.delete({ where: { id } });
  revalidatePath("/admin/courts");
  revalidatePath("/schedule");
}
