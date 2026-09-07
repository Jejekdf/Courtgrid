"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function CourtsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("courts");
  const tc = useTranslations("common");
  console.error("Courts page error:", error);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col items-center justify-center text-center gap-4 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl py-16 px-6">
        <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-950 text-balance">
            {t("errorTitle")}
          </h2>
          <p className="text-sm text-zinc-500 max-w-sm text-pretty">
            {t("errorCatalogDesc")}
          </p>
        </div>
        <Button onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
          {tc("retry")}
        </Button>
      </div>
    </div>
  );
}