import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("success");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale; session_id?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("success");

  return (
    <div className="w-full flex-1 flex items-center justify-center py-16 px-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto size-16 rounded-full bg-emerald-100/80 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/reservations">
            <Button className="w-full min-h-11">{t("viewReservations")}</Button>
          </Link>
          <Link href="/dashboard/book">
            <Button variant="secondary" className="w-full min-h-11">{t("bookAgain")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
