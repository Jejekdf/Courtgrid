"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, MapPin, CalendarPlus, ChevronRight, CalendarCheck, ShieldCheck, Activity } from "lucide-react";
import ReservationList, { type ReservationRow } from "@/components/dashboard/ReservationList";
import { safeFormatDate } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";

interface CustomerDashboardContentProps {
  user: { name: string | null; email: string | null };
  reservations: ReservationRow[];
}

export default function CustomerDashboardContent({ user, reservations }: CustomerDashboardContentProps) {
  const upcomingBooking = reservations.find(
    (r) => (r.status === "DP_PAID" || r.status === "PENDING" || r.payment?.status === "VERIFIED") && new Date(r.date) >= new Date()
  );

  const totalBookings = reservations.length;
  const activeBookings = reservations.filter(
    (r) => r.status === "DP_PAID" || r.payment?.status === "VERIFIED"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 max-w-7xl mx-auto text-zinc-950"
    >
      {/* Clean PageHeader */}
      <PageHeader
        title={`Selamat Datang, ${user.name || "Pelanggan"}`}
        description="Ringkasan aktivitas sewa arena, jadwal main aktif, dan riwayat reservasi Anda."
        actions={
          <Link href="/dashboard/book">
            <button className="px-4 py-2.5 text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0 cursor-pointer">
              <CalendarPlus className="w-4 h-4" />
              <span>Pesan Lapangan Baru</span>
            </button>
          </Link>
        }
      />

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Total Transaksi</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 font-mono">{totalBookings}</div>
          <p className="text-sm text-zinc-400 font-mono">Keseluruhan penyewaan arena</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Booking Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 font-mono">{activeBookings}</div>
          <p className="text-sm text-zinc-400 font-mono">Status DP 50% Verified</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Status Akun</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-emerald-600 font-mono uppercase">AKTIF</div>
          <p className="text-sm text-zinc-400 font-mono">{user.email}</p>
        </div>
      </div>

      {/* Upcoming Booking Banner */}
      {upcomingBooking && (
        <div className="p-5 bg-zinc-950 text-white rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Jadwal Main Berikutnya
              </span>
            </div>
            <div className="text-base font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {upcomingBooking.court?.name}
            </div>
            <div className="text-sm text-zinc-200 flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-zinc-300" />
              {safeFormatDate(upcomingBooking.date, "dd MMMM yyyy")} ({upcomingBooking.startTime} - {upcomingBooking.endTime} WIB)
            </div>
          </div>
          <Link href="/dashboard/reservations">
            <button className="px-4 py-2 text-xs font-bold bg-white text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
              <span>Buka E-Ticket</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}

      {/* Recent Reservations Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-zinc-950">Reservasi Terbaru</h2>
            <p className="text-sm text-zinc-500 font-mono">Daftar penyewaan arena terkini Anda.</p>
          </div>
          <Link href="/dashboard/reservations" className="text-xs font-bold text-zinc-950 hover:underline font-mono">
            Lihat Semua Transaksi &rarr;
          </Link>
        </div>

        <ReservationList reservations={reservations} />
      </div>
    </motion.div>
  );
}
