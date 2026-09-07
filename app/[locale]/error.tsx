"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-zinc-950 text-balance">{t("genericErrorTitle")}</h1>
      <p className="text-sm text-zinc-500 max-w-md text-pretty">
        {t("genericErrorDesc")}
      </p>
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </div>
  );
}