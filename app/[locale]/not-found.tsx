import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-emerald-600">404</p>
      <h1 className="text-xl font-semibold text-zinc-950 text-balance">{t("notFoundTitle")}</h1>
      <p className="text-sm text-zinc-500 max-w-md text-pretty">
        {t("notFoundDesc")}
      </p>
      <Link href="/">
        <Button>{t("backHome")}</Button>
      </Link>
    </div>
  );
}