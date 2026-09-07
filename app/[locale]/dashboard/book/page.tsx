import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CustomerBookingWorkspace from "@/components/dashboard/CustomerBookingWorkspace";
import PageHeader from "@/components/ui/PageHeader";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.book");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function CustomerBookPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("dashboard.book");

  if (!session || !session.user || !session.user.id) {
    redirect({ href: "/login", locale });
  }

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950">
      {/* Shared Reusable PageHeader (Consistent with Admin) */}
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDesc")}
      />

      <CustomerBookingWorkspace />
    </div>
  );
}
