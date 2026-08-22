
"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useMutation } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "react-use";
import { cancelReservationAction } from "@/features/reservations/actions";
import { reservationListParsers } from "@/lib/search-params";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReservationFilters } from "./reservations/ReservationFilters";
import { ReservationTableRow } from "./reservations/ReservationTableRow";

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

export default function ReservationList({
  reservations,
}: {
  reservations: ReservationRow[];
}) {
  const [filter, setFilter] = useQueryState("status", reservationListParsers.status.withOptions({ shallow: true }));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) =>
      cancelReservationAction({ reservationId }),
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
    if (filter === "DP_PAID")
      return res.status === "DP_PAID" || res.payment?.status === "VERIFIED";
    return res.status === filter;
  });

  const handleCancelBooking = (resId: string) => {
    setPendingCancelId(resId);
    setIsCancelDialogOpen(true);
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
      <ReservationFilters
        filter={filter}
        onFilterChange={setFilter}
        totalCount={reservations.length}
      />

      {/* Desktop & Tablet Clean Table View */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
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
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-zinc-400 font-mono"
                  >
                    Tidak ada reservasi dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <ReservationTableRow
                    key={res.id}
                    reservation={res}
                    copiedId={copiedId}
                    onCopyId={handleCopyId}
                    onCancel={handleCancelBooking}
                    isCancelling={
                      cancelMutation.isPending &&
                      cancelMutation.variables === res.id
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan pesanan pending ini? Slot lapangan akan dilepas kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingCancelId) cancelMutation.mutate(pendingCancelId);
                setIsCancelDialogOpen(false);
              }}
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
