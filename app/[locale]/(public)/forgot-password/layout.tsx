import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgot" });
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
