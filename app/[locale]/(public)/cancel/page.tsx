import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "cancel" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function PaymentCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "cancel" });

  return (
    <div className="w-full flex-1 flex items-center justify-center py-16 px-4 bg-[var(--background)]">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto size-16 rounded-full bg-red-100/80 flex items-center justify-center">
          <XCircle className="size-8 text-red-600" />
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
          <Link href="/dashboard/book">
            <Button className="w-full min-h-11">{t("backToBooking")}</Button>
          </Link>
          <Link href="/dashboard/reservations">
            <Button variant="secondary" className="w-full min-h-11">{t("viewReservations")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
