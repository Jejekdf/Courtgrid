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
  const title = `${t("metaTitle")} | CourtGrid`;
  const description = t("metaDesc");
  const url = `${BASE_URL}/${locale}/courts`;

  return {
    title: t("metaTitle"),
    description,
    alternates: {
      canonical: url,
      languages: {
        id: `${BASE_URL}/id/courts`,
        en: `${BASE_URL}/en/courts`,
        "x-default": `${BASE_URL}/courts`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CourtGrid",
      locale: locale === "id" ? "id_ID" : "en_US",
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function CourtsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const th = await getTranslations({ locale: locale as "id" | "en", namespace: "header" });

  const breadcrumbItems = [
    { label: th("navBeranda"), href: "/" },
    { label: th("navKatalog") },
  ];

  return (
    <div className="min-h-dvh pt-6 pb-16 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        <Suspense fallback={<CourtState type="loading" />}>
          <CourtCatalog />
        </Suspense>
      </div>
    </div>
  );
}