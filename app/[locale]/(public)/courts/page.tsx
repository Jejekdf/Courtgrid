import { Suspense } from "react";
import type { Metadata } from "next";
import CourtCatalog from "@/components/courts/CourtCatalog";
import CourtState from "@/components/courts/CourtState";
import { getTranslations } from "next-intl/server";

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
  };
}

export default function CourtsPage() {
  return (
    <Suspense fallback={<CourtState type="loading" />}>
      <CourtCatalog />
    </Suspense>
  );
}