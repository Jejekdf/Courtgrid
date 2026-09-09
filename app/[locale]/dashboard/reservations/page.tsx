import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect, Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCustomerReservationsDAL } from "@/features/reservations/dal";
import { CalendarPlus } from "lucide-react";
import ReservationList from "@/components/dashboard/ReservationList";
import PageHeader from "@/components/ui/PageHeader";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.reservations");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function CustomerReservationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("dashboard.reservations");
  const tHome = await getTranslations("dashboard.home");

  if (!session || !session.user || !session.user.id) {
    redirect({ href: "/login", locale });
    return null;
  }

  if (session.user.role === "ADMIN") {
    redirect({ href: "/admin", locale });
    return null;
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
        title={t("pageTitle")}
        description={t("pageDesc")}
        actions={
          <Link
            href="/dashboard/book"
            className="px-4 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <CalendarPlus className="size-4" />
            <span>{tHome("newBooking")}</span>
          </Link>
        }
      />

      {/* Baseline Divide Reservation List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t("allCount", { count: reservations.length })}
          </span>
          <span className="text-sm text-zinc-500 font-sans">{t("stripeAuto")}</span>
        </div>

        <ReservationList reservations={reservations} />
      </div>
    </div>
  );
}
