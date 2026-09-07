import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.forgot");
  return {
    title: `${t("metaTitle")} | CourtGrid`,
    robots: { index: false, follow: false },
  };
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
