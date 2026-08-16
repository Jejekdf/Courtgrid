import { Metadata } from "next";
import CareersContent from "@/components/careers/CareersContent";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "careers" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default function CareersPage() {
  return <CareersContent />;
}
