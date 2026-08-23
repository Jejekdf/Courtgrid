"use client";

import { AlertTriangle, RotateCcw, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Props =
  | { type: "loading" }
  | { type: "error"; onRetry: () => void }
  | { type: "empty"; onReset: () => void };

export default function CourtState(props: Props) {
  const t = useTranslations("courts");

  if (props.type === "loading") {
    return (
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-busy="true"
        aria-label={t("stateLoadingAria")}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white overflow-hidden animate-pulse"
          >
            <div className="h-44 bg-zinc-100" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-2/3 rounded-full bg-zinc-200" />
              <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
              <div className="h-3 w-full rounded-full bg-zinc-100 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (props.type === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center text-center gap-4 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl py-16 px-6"
      >
        <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-950">
            {t("stateErrorTitle")}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            {t("stateErrorDesc")}
          </p>
        </div>
        <Button onClick={props.onRetry} leftIcon={<RotateCcw className="h-4 w-4" />}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center text-center gap-4 py-16 px-6 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl"
    >
      <div className="h-12 w-12 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
        <SearchX className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-950">
          {t("stateEmptyTitle")}
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          {t("stateEmptyDesc")}
        </p>
      </div>
      <Button onClick={props.onReset} variant="outline">
        {t("resetSearch")}
      </Button>
    </div>
  );
}