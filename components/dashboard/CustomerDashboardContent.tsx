"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Clock, MapPin, CalendarPlus, ChevronRight, CalendarCheck, ShieldCheck, Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import ReservationList, { type ReservationRow } from "@/components/dashboard/ReservationList";
import { safeFormatDate } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";

interface CustomerDashboardContentProps {
  user: { name: string | null; email: string | null };
  reservations: ReservationRow[];
}

export default function CustomerDashboardContent({ user, reservations }: CustomerDashboardContentProps) {
  const t = useTranslations("dashboard.home");
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
      className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950"
    >
      {/* Clean PageHeader */}
      <PageHeader
        title={t("welcome", { name: user.name || t("defaultName") })}
        description={t("welcomeDesc")}
        actions={
          <Link href="/dashboard/book">
            <button className="px-4 py-2.5 text-sm font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0 cursor-pointer">
              <CalendarPlus className="size-4" />
              <span>{t("newBooking")}</span>
            </button>
          </Link>
        }
      />

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">{t("statTotal")}</span>
            <div className="size-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
              <CalendarCheck className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 font-mono">{totalBookings}</div>
          <p className="text-sm text-zinc-400 font-mono">{t("statTotalSub")}</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">{t("statVerified")}</span>
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 font-mono">{activeBookings}</div>
          <p className="text-sm text-zinc-400 font-mono">{t("statVerifiedSub")}</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">{t("accountStatus")}</span>
            <div className="size-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-emerald-600 font-mono uppercase">{t("accountActive")}</div>
          <p className="text-sm text-zinc-400 font-mono">{user.email}</p>
        </div>
      </div>

      {/* Upcoming Booking Banner */}
      {upcomingBooking && (
        <div className="p-5 bg-zinc-950 text-white rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[0.6875rem] font-mono font-bold uppercase tracking-wider text-emerald-400">
                {t("nextSession")}
              </span>
            </div>
            <div className="text-base font-extrabold text-white flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" />
              {upcomingBooking.court?.name}
            </div>
            <div className="text-sm text-zinc-200 flex items-center gap-2 font-mono">
              <Clock className="size-4 text-zinc-300" />
              {safeFormatDate(upcomingBooking.date, "dd MMMM yyyy")} ({upcomingBooking.startTime} - {upcomingBooking.endTime} WIB)
            </div>
          </div>
          <Link href="/dashboard/reservations">
            <button className="px-4 py-2 text-sm font-bold bg-white text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
              <span>{t("openETicket")}</span>
              <ChevronRight className="size-4" />
            </button>
          </Link>
        </div>
      )}

      {/* Recent Reservations Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-zinc-950">{t("recentTitle")}</h2>
            <p className="text-sm text-zinc-500 font-mono">{t("recentDesc")}</p>
          </div>
          <Link href="/dashboard/reservations" className="text-sm font-bold text-zinc-950 hover:underline font-mono">
            {t("viewAll")} &rarr;
          </Link>
        </div>

        <ReservationList reservations={reservations} />
      </div>
    </motion.div>
  );
}
