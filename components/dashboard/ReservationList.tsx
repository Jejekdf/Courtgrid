"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { safeFormatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QrCode, ShieldCheck, XCircle, Filter, CheckCircle2, ArrowUpRight, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "react-use";
import { cancelReservationAction } from "@/features/reservations/actions";

export type ReservationRow = {
  id: string;
  court: { name: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  payment: { dpAmount?: number; status?: string } | null;
};

export default function ReservationList({ reservations }: { reservations: ReservationRow[] }) {
  const [filter, setFilter] = useState<"ALL" | "DP_PAID" | "PENDING" | "CANCELED">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => cancelReservationAction({ reservationId }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    },
    onError: () => toast.error("Gagal membatalkan booking. Coba lagi."),
  });

  const handleCopyId = (id: string) => {
    copyToClipboard(id);
    setCopiedId(id);
    toast.success("ID Reservasi berhasil disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredReservations = reservations.filter((res) => {
    if (filter === "ALL") return true;
    if (filter === "DP_PAID") return res.status === "DP_PAID" || res.payment?.status === "VERIFIED";
    return res.status === filter;
  });

  const handleCancelBooking = (resId: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan pesanan pending ini? Slot lapangan akan dilepas kembali.")) {
      cancelMutation.mutate(resId);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-zinc-200/80 rounded-2xl space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-zinc-950 text-sm">Belum Ada Riwayat Booking</p>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto mt-1 font-mono">
            Lakukan reservasi pertama Anda di halaman booking untuk mulai menggunakan lapangan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
            filter === "ALL"
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
          }`}
        >
          Semua ({reservations.length})
        </button>

        <button
          onClick={() => setFilter("DP_PAID")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
            filter === "DP_PAID"
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          }`}
        >
          DP Verified
        </button>

        <button
          onClick={() => setFilter("PENDING")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
            filter === "PENDING"
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => setFilter("CANCELED")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
            filter === "CANCELED"
              ? "bg-zinc-950 text-white shadow-xs"
              : "bg-red-50 text-red-800 hover:bg-red-100"
          }`}
        >
          Dibatalkan
        </button>
      </div>

      {/* Desktop & Tablet Clean Table View */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-xs font-mono text-zinc-500 uppercase bg-zinc-50/60 border-b border-zinc-200/80 font-bold">
              <tr>
                <th className="px-5 py-4">Arena Lapangan</th>
                <th className="px-5 py-4">Tanggal Main</th>
                <th className="px-5 py-4">Jam Sesi</th>
                <th className="px-5 py-4">Status Booking</th>
                <th className="px-5 py-4">Status DP Stripe</th>
                <th className="px-5 py-4 text-right">Total Biaya</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-zinc-400 font-mono">
                    Tidak ada reservasi dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const payStatus = res.payment?.status || "PENDING";
                  const isVerified = res.status === "DP_PAID" || payStatus === "VERIFIED";

                  return (
                    <tr key={res.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-zinc-950">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
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
                            onClick={() => handleCopyId(res.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-950 rounded transition-colors cursor-pointer"
                            title="Salin ID Booking"
                          >
                            {copiedId === res.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
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
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border ${
                            res.status === "DP_PAID"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : res.status === "PENDING"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : res.status === "DONE"
                              ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {res.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            VERIFIED (50% DP)
                          </span>
                        ) : res.status === "CANCELED" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                            HANGUS / BATAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            UNPAID
                          </span>
                        )}
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
                              isLoading={cancelMutation.isPending && cancelMutation.variables === res.id}
                              disabled={cancelMutation.isPending && cancelMutation.variables === res.id}
                              onClick={() => handleCancelBooking(res.id)}
                              className="text-xs px-2.5 rounded-lg cursor-pointer"
                              leftIcon={<XCircle className="w-3 h-3" />}
                            >
                              Batalkan
                            </Button>
                          )}
                          {isVerified ? (
                            <Link
                              href={`/dashboard/reservations/${res.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-xs"
                            >
                              <span>E-Ticket</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : res.status === "CANCELED" ? (
                            <span className="text-xs text-zinc-400 font-mono px-2 py-1 bg-zinc-100 rounded-md">
                              Expired
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
