import { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard | CourtGrid",
  description: "Kelola reservasi dan lapangan di CourtGrid.",
  robots: { index: false, follow: false },
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
    return null;
  }

  if (session.user.role !== "ADMIN") {
    redirect({ href: "/", locale });
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
