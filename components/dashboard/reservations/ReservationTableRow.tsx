"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { safeFormatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowUpRight, Copy, Check } from "lucide-react";
import type { ReservationRow } from "@/components/dashboard/ReservationList";
import { ReservationStatusBadge, PaymentStatusBadge } from "./ReservationStatusBadge";

interface ReservationTableRowProps {
  reservation: ReservationRow;
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

export function ReservationTableRow({
  reservation: res,
  copiedId,
  onCopyId,
  onCancel,
  isCancelling,
}: ReservationTableRowProps) {
  const t = useTranslations("dashboard.reservations");
  const payStatus = res.payment?.status || "PENDING";
  const isVerified = res.status === "DP_PAID" || payStatus === "VERIFIED";

  return (
    <tr className="hover:bg-zinc-50/60 transition-colors">
      <td className="px-5 py-4 font-bold text-zinc-950">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${
              isVerified
                ? "bg-emerald-500"
                : res.status === "PENDING"
                ? "bg-amber-500"
                : "bg-zinc-300"
            }`}
          />
          <span>{res.court?.name}</span>
          <button
            type="button"
            onClick={() => onCopyId(res.id)}
            className="p-1 text-zinc-400 hover:text-zinc-950 rounded transition-colors cursor-pointer"
            aria-label={t("copyId")}
          >
            {copiedId === res.id ? (
              <Check className="size-3 text-emerald-600" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>
      </td>
      <td className="px-5 py-4 font-mono text-zinc-700">
        {safeFormatDate(res.date, "dd MMM yyyy")}
      </td>
      <td className="px-5 py-4 font-mono text-zinc-700 whitespace-nowrap">
        {res.startTime} - {res.endTime} WIB
      </td>
      <td className="px-5 py-4">
        <ReservationStatusBadge status={res.status} />
      </td>
      <td className="px-5 py-4">
        <PaymentStatusBadge
          isVerified={isVerified}
          reservationStatus={res.status}
        />
      </td>
      <td className="px-5 py-4 text-right font-extrabold text-zinc-950 font-mono">
        Rp {new Intl.NumberFormat("id-ID").format(res.totalPrice)}
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {res.status === "PENDING" && (
            <Button
              variant="destructive"
              size="sm"
              isLoading={isCancelling}
              disabled={isCancelling}
              onClick={() => onCancel(res.id)}
              className="text-sm px-2.5 rounded-lg cursor-pointer"
              leftIcon={<XCircle className="size-3" />}
            >
              {t("cancelBtn")}
            </Button>
          )}
          {isVerified ? (
            <Link
              href={`/dashboard/reservations/${res.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <span>{t("eticketBtn")}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          ) : res.status === "CANCELED" ? (
            <span className="text-sm text-zinc-400 font-mono px-2 py-1 bg-zinc-100 rounded-md">
              {t("expiredBadge")}
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
