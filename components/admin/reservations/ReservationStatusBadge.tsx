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
  const isVerified = paymentStatus === "VERIFIED";

  let statusBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap",
        className
      )}
    >
      {t("statusPending")}
    </span>
  );

  if (status === "DONE") {
    statusBadge = (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap",
          className
        )}
      >
        {t("statusDone")}
      </span>
    );
  } else if (status === "CANCELED") {
    statusBadge = (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 whitespace-nowrap",
          className
        )}
      >
        {t("statusCanceled")}
      </span>
    );
  } else if (isDpPaid) {
    statusBadge = (
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

  return (
    <div className="inline-flex flex-col items-start gap-1">
      {statusBadge}
      {isVerified && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap"
          title="Verified by Stripe"
        >
          <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span>Verified by Stripe</span>
        </span>
      )}
    </div>
  );
}
