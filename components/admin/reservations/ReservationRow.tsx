"use client";

import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRupiah } from "@/lib/utils";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

export interface ReservationRowData {
  id: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  payment?: { status?: string; dpAmount?: number } | null;
}

interface ReservationRowProps {
  reservation: ReservationRowData;
  onDelete: (id: string) => void;
}

export function ReservationRow({ reservation, onDelete }: ReservationRowProps) {
  const t = useTranslations("admin.reservations");
  const tDash = useTranslations("admin.dashboard");

  return (
    <tr className="hover:bg-zinc-50/50 transition-colors print:hover:bg-transparent">
      <td className="px-6 py-4.5 print:px-2 text-zinc-700">
        <div className="text-xs text-zinc-400 font-mono mb-0.5">{reservation.id.slice(0, 8)}</div>
        <div className="font-semibold text-zinc-950 text-sm sm:text-base">
          {reservation.date ? format(new Date(reservation.date), "dd MMM yyyy") : "-"}
        </div>
      </td>
      <td className="px-6 py-4.5 print:px-2">
        <div className="font-semibold text-zinc-950 text-sm sm:text-base">
          {reservation.user?.name || "Pelanggan Hapus"}
        </div>
        <div className="text-xs sm:text-sm text-zinc-500">{reservation.user?.email || "-"}</div>
      </td>
      <td className="px-6 py-4.5 print:px-2 text-zinc-700">
        <div className="font-semibold text-zinc-950 text-sm sm:text-base">
          {reservation.court?.name || tDash("defaultCourt")}
        </div>
        <div className="text-xs sm:text-sm text-zinc-500 font-mono">
          {reservation.startTime} - {reservation.endTime} WIB
        </div>
      </td>
      <td className="px-6 py-4.5 print:px-2 font-bold font-mono text-zinc-950 text-sm sm:text-base tabular-nums">
        {formatRupiah(reservation.totalPrice)}
      </td>
      <td className="px-6 py-4.5 print:px-2">
        <ReservationStatusBadge status={reservation.status} paymentStatus={reservation.payment?.status} />
      </td>
      <td className="px-6 py-4.5 print:hidden text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/eticket/${reservation.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-10 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors cursor-pointer"
            title={t("viewTicketTitle")}
          >
            <ArrowUpRight className="size-4" />
            <span>{t("eticketBtn")}</span>
          </Link>
          <button
            onClick={() => onDelete(reservation.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-10 text-xs sm:text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer font-semibold"
            title={t("deleteBtnTitle")}
          >
            <Trash2 className="size-4" />
            <span>{t("deleteBtn")}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
