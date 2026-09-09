"use client";

import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRupiah } from "@/lib/utils";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import type { ReservationRowData } from "./ReservationRow";

interface ReservationCardProps {
  reservation: ReservationRowData;
  onDelete: (id: string) => void;
}

export function ReservationCard({ reservation, onDelete }: ReservationCardProps) {
  const t = useTranslations("admin.reservations");
  const tDash = useTranslations("admin.dashboard");

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-zinc-950 leading-tight truncate">
            {reservation.user?.name || "Pelanggan Hapus"}
          </h4>
          <span className="text-[0.6875rem] font-mono text-zinc-400 block truncate">
            ID: {reservation.id.slice(0, 8)} • {reservation.user?.email || "-"}
          </span>
        </div>
        <div className="shrink-0">
          <ReservationStatusBadge status={reservation.status} paymentStatus={reservation.payment?.status} />
        </div>
      </div>

      <div className="bg-zinc-50/70 border border-zinc-100 rounded-lg p-2.5 space-y-1 text-xs text-zinc-700">
        <div className="flex justify-between">
          <span className="font-semibold text-zinc-900">{reservation.court?.name || tDash("defaultCourt")}</span>
          <span className="font-mono text-zinc-500">
            {reservation.date ? format(new Date(reservation.date), "dd MMM yyyy") : "-"}
          </span>
        </div>
        <div className="flex justify-between font-mono text-zinc-500 text-[0.6875rem]">
          <span>
            {reservation.startTime} - {reservation.endTime} WIB
          </span>
          <span className="font-bold text-zinc-950 text-xs">{formatRupiah(reservation.totalPrice)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/admin/eticket/${reservation.id}`}
          className="flex-1 min-h-10 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors"
        >
          <ArrowUpRight className="size-3.5" />
          <span>{t("eticketBtn")}</span>
        </Link>
        <button
          onClick={() => onDelete(reservation.id)}
          className="min-h-10 px-3.5 inline-flex items-center justify-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer font-semibold"
        >
          <Trash2 className="size-3.5" />
          <span>{t("deleteBtn")}</span>
        </button>
      </div>
    </div>
  );
}
