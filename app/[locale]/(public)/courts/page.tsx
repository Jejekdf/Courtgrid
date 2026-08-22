import { Suspense } from "react";
import type { Metadata } from "next";
import CourtCatalog from "@/components/courts/CourtCatalog";
import CourtState from "@/components/courts/CourtState";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "courts" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/courts`,
      languages: {
        id: `${BASE_URL}/id/courts`,
        en: `${BASE_URL}/en/courts`,
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      url: `${BASE_URL}/${locale}/courts`,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function CourtsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "courts" });
  const th = await getTranslations({ locale: locale as "id" | "en", namespace: "header" });

  const breadcrumbItems = [
    { label: th("navBeranda"), href: "/" },
    { label: t("metaTitle") },
  ];

  return (
    <div className="min-h-screen pt-28 pb-4 px-4 sm:px-6 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
      </div>
      <Suspense fallback={<CourtState type="loading" />}>
        <CourtCatalog />
      </Suspense>
    </div>
  );
}