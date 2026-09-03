import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppUser } from "@/auth.config";
import { getReservationDetailsDAL } from "@/features/reservations/dal";
import PrintButton from "@/components/ui/PrintButton";
import { AdminCheckInButton } from "@/components/admin/eticket/AdminCheckInButton";
import { ArrowLeft, ShieldCheck, Calendar, Clock, Receipt, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { formatRupiah, safeFormatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = await getTranslations("admin.eticket");
  const ticketId = await params.then((p) => p.id);
  const reservation = await getReservationDetailsDAL(ticketId).catch(() => null);

  if (!reservation) {
    return { title: t("notFoundMeta") };
  }

  return {
    title: `E-Ticket #${reservation.id.slice(0, 8)} – ${reservation.court?.name ?? ""} | CourtGrid Admin`,
    description: `Detail e-ticket reservasi lapangan di CourtGrid.`,
  };
}

export default async function AdminETicketPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if ((session.user as AppUser).role !== "ADMIN") {
    redirect("/");
  }
  const t = await getTranslations("admin.eticket");

  const ticketId = await params.then((p) => p.id);
  let reservation;
  try {
    reservation = await getReservationDetailsDAL(ticketId);
  } catch {
    notFound();
  }

  if (!reservation) {
    notFound();
  }

  const dpAmount = reservation.payment?.dpAmount ?? Math.round(reservation.totalPrice * 0.5);
  const remainingAmount = reservation.totalPrice - dpAmount;
  const isVerified = reservation.status === "DP_PAID" || reservation.payment?.status === "VERIFIED";

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back Link */}
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        {t("backLink")}
      </Link>

      {/* E-Ticket Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-950 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <ShieldCheck className="size-7 text-emerald-400" />
                CourtGrid E-Ticket
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {t("venueHint")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">{t("ticketId")}</div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                {reservation.id}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* QR + Customer Info */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
              <svg className="size-32" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,0 h20 v10 h-20 z M0,40 h10 v20 h-10 z M40,40 h20 v20 h-20 z M70,40 h10 v10 h-10 z M90,50 h10 v20 h-10 z M40,70 h10 v30 h-10 z M60,70 h30 v10 h-30 z M80,90 h20 v10 h-20 z" />
              </svg>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-2 text-lg font-bold text-zinc-950">
                <Receipt className="size-5 text-zinc-400" />
                {reservation.court?.name ?? t("unknownCourt")}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-600">
                <span
                  className={`size-2 rounded-full ${
                    isVerified
                      ? "bg-emerald-500"
                      : reservation.status === "PENDING"
                        ? "bg-amber-500"
                        : reservation.status === "DONE"
                          ? "bg-zinc-500"
                          : "bg-red-500"
                  }`}
                />
                {reservation.status === "PENDING"
                  ? t("statusPending")
                  : reservation.status === "DP_PAID"
                    ? t("statusDpPaid")
                    : reservation.status === "DONE"
                      ? t("statusDone")
                      : t("statusCanceled")}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Calendar className="size-4 text-zinc-400" />
                  <span>{safeFormatDate(reservation.date, "EEEE, dd MMMM yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600">
                  <Clock className="size-4 text-zinc-400" />
                  <span className="font-mono">
                    {reservation.startTime} - {reservation.endTime} WIB
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600">
                  <Mail className="size-4 text-zinc-400" />
                  <span>{reservation.user?.email ?? "-"}</span>
                </div>
                {reservation.user?.name && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Phone className="size-4 text-zinc-400" />
                    <span>{reservation.user.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Payment Breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              {t("paymentBreakdown")}
            </h2>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("totalLabel")}</span>
                <span className="font-semibold text-zinc-900">{formatRupiah(reservation.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("dpLabel")}</span>
                <span className="font-semibold text-emerald-600">{formatRupiah(dpAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("remainingLabel")}</span>
                <span className="font-semibold text-zinc-900">{formatRupiah(remainingAmount)}</span>
              </div>
              {reservation.payment?.dpAmount !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">{t("payOnsiteLabel")}</span>
                  <span className="font-semibold text-zinc-900">
                    {formatRupiah(reservation.totalPrice - reservation.payment.dpAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Admin Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">{t("paymentStatusLabel")}</div>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border">
                {isVerified ? (
                  <>
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    <span className="text-emerald-700 border-emerald-200 bg-emerald-50">{t("dpPaidBadge")}</span>
                  </>
                ) : reservation.status === "CANCELED" ? (
                  <span className="text-red-600 border-red-200 bg-red-50">{t("canceledBadge")}</span>
                ) : (
                  <span className="text-amber-700 border-amber-200 bg-amber-50">{t("awaitingBadge")}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PrintButton />
              <AdminCheckInButton reservationId={reservation.id} status={reservation.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
