import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCustomerReservationsDAL } from "@/features/reservations/dal";
import { CalendarPlus } from "lucide-react";
import ReservationList from "@/components/dashboard/ReservationList";
import Link from "next/link";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Riwayat Booking | CourtGrid User Portal",
  description: "Daftar riwayat pemesanan lapangan Anda di CourtGrid.",
};

export default async function CustomerReservationsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const reservationsRaw = await getCustomerReservationsDAL();

  const reservations = reservationsRaw.map((r) => ({
    id: r.id,
    court: r.courtName ? { name: r.courtName } : null,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
    totalPrice: r.totalPrice,
    status: r.status,
    user: { name: r.userName ?? null, email: r.userEmail ?? null },
    payment: r.dpAmount !== undefined || r.paymentStatus !== undefined ? { dpAmount: r.dpAmount, status: r.paymentStatus } : null,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-zinc-950">
      {/* Unified Page Header Component */}
      <PageHeader
        title="Riwayat Booking Lapangan"
        description="Pantau seluruh data reservasi, jadwal main, E-Ticket QR, dan verifikasi pelunasan DP 50% via Stripe."
        actions={
          <Link href="/dashboard/book">
            <button className="px-4 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0">
              <CalendarPlus className="w-4 h-4" />
              <span>Pesan Lapangan Baru</span>
            </button>
          </Link>
        }
      />

      {/* Baseline Divide Reservation List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Semua Transaksi ({reservations.length})
          </span>
          <span className="text-sm text-zinc-500 font-mono">Status Otomatis via Stripe</span>
        </div>
        
        <ReservationList reservations={reservations} />
      </div>
    </div>
  );
}
