"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ReservationStatusBadgeProps {
  status: string;
  paymentStatus?: string | null;
  className?: string;
}

export function ReservationStatusBadge({
  status,
  paymentStatus,
  className,
}: ReservationStatusBadgeProps) {
  const t = useTranslations("admin.reservations");

  const isDpPaid = status === "DP_PAID" || paymentStatus === "VERIFIED";

  if (isDpPaid) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap",
          className
        )}
      >
        {t("statusDpPaid")}
      </span>
    );
  }

  if (status === "DONE") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap",
          className
        )}
      >
        {t("statusDone")}
      </span>
    );
  }

  if (status === "CANCELED") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 whitespace-nowrap",
          className
        )}
      >
        {t("statusCanceled")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap",
        className
      )}
    >
      {t("statusPending")}
    </span>
  );
}
