"use client";

import { CalendarX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ReservationStatusBadge } from "./reservations/ReservationStatusBadge";

interface Reservation {
  id: string;
  customerName: string;
  courtName: string;
  date: string;
  time: string;
  status: "PENDING" | "DP_PAID" | "DONE" | "CANCELED";
  amount: string;
  paymentStatus?: string;
}

export default function RecentReservationsTable({ reservations = [] }: { reservations?: Reservation[] }) {
  const t = useTranslations("admin.dashboard");

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
        <h3 className="text-lg font-medium tracking-tight text-zinc-950">{t("recentTitle")}</h3>
        <Link href="/admin/reservations" className="text-sm font-medium text-zinc-950 hover:text-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer">
          <span>{t("viewAll")}</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="size-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <CalendarX className="size-6 text-zinc-400" />
          </div>
          <h4 className="text-base font-semibold text-zinc-950 mb-1">{t("emptyTitle")}</h4>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            {t("emptyDesc")}
          </p>
        </div>
      ) : (
        <>
          {/* Card view for mobile and tablet (< 1024px) */}
          <div className="block lg:hidden divide-y divide-zinc-100">
            {reservations.map((res) => (
              <div key={res.id} className="p-4 sm:p-5 space-y-3 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-zinc-950 leading-tight">{res.customerName}</h4>
                    <span className="text-xs font-mono text-zinc-400">ID: {res.id}</span>
                  </div>
                  <ReservationStatusBadge status={res.status} paymentStatus={res.paymentStatus} />
                </div>
                <div className="bg-zinc-50/70 border border-zinc-100 rounded-lg p-2.5 space-y-1 text-xs text-zinc-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-zinc-900">{res.courtName}</span>
                    <span className="font-mono text-zinc-500">{res.date}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-zinc-500">
                    <span>{res.time}</span>
                    <span className="font-bold text-zinc-950 tabular-nums">{res.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table — only at 1024px+ where sidebar + content fits */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4.5">{t("colId")}</th>
                  <th className="px-6 py-4.5">{t("colCustomer")}</th>
                  <th className="px-6 py-4.5">{t("colCourt")}</th>
                  <th className="px-6 py-4.5">{t("colSchedule")}</th>
                  <th className="px-6 py-4.5">{t("colAmount")}</th>
                  <th className="px-6 py-4.5">{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-mono text-xs text-zinc-500">{res.id}</td>
                    <td className="px-6 py-4.5 font-semibold text-zinc-950 text-sm sm:text-base">{res.customerName}</td>
                    <td className="px-6 py-4.5 text-zinc-700 text-sm">{res.courtName}</td>
                    <td className="px-6 py-4.5 text-zinc-700">
                      <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm whitespace-nowrap">
                        <span className="text-zinc-900 font-medium">{res.date}</span>
                        <span className="text-zinc-300">,</span>
                        <span className="text-zinc-500">{res.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-bold font-mono text-zinc-950 text-sm sm:text-base tabular-nums">{res.amount}</td>
                    <td className="px-6 py-4.5"><ReservationStatusBadge status={res.status} paymentStatus={res.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
