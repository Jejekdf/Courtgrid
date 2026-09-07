import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/dal";
import { getCustomerReservationsDAL } from "@/features/reservations/dal";
import CustomerDashboardContent from "@/components/dashboard/CustomerDashboardContent";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.home");
  return {
    title: `${t("metaTitle")} | CourtGrid`,
    description: t("metaDesc"),
  };
}

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  if (user.role === "ADMIN") {
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

  return <CustomerDashboardContent user={{ name: user.name, email: user.email }} reservations={reservations} />;
}
