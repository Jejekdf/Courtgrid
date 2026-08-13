"use server";

import { prisma } from "@/lib/prisma"; 
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";


// Sesuaikan path prisma dengan struktur folder kamu

export async function getRecentNotifications() {
  try {
    // Ambil 5 reservasi terbaru dari database
    const recentBookings = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        court: true,
      },
    });

    // Format data agar sesuai dengan bentuk NotificationItem di frontend
    const notifications = recentBookings.map((res) => {
      // Tentukan tipe dan judul berdasarkan status reservasi
      const isPayment = res.status === "DP_PAID" || res.status === "DONE";
      
      return {
        id: res.id,
        type: isPayment ? "payment" : "booking",
        title: isPayment ? "Pembayaran Diterima" : "Booking Baru",
        message: `${res.user?.name || "User"} mem-booking ${res.court?.name || "Lapangan"}.`,
        time: formatDistanceToNow(new Date(res.createdAt), { addSuffix: true, locale: id }), // cth: "5 menit yang lalu"
        isRead: false, // Default false, atau bisa dihubungkan ke database jika ada kolomnya
      };
    });

    return notifications;
  } catch (error) {
    console.error("Gagal mengambil notifikasi:", error);
    return [];
  }
}
