import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.reset" });
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
