"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CreditCard, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import {
  resumeReservationPaymentAction,
  cancelReservationAction,
} from "@/features/reservations/actions";
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

interface ETicketPendingActionsProps {
  reservationId: string;
  dpAmount: number;
}

export default function ETicketPendingActions({
  reservationId,
  dpAmount,
}: ETicketPendingActionsProps) {
  const router = useRouter();
  const [isResuming, setIsResuming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleResumePayment = async () => {
    setIsResuming(true);
    try {
      const result = await resumeReservationPaymentAction(reservationId);
      if (result.success && result.url) {
        toast.success("Mengarahkan ke pembayaran aman Stripe...");
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Gagal melanjutkan pembayaran. Silakan coba lagi.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menyiapkan pembayaran.");
    } finally {
      setIsResuming(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelReservationAction({ reservationId });
      if (result.success) {
        toast.success(result.message || "Reservasi berhasil dibatalkan.");
        setIsCancelDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal membatalkan reservasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membatalkan reservasi.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
            <Clock className="size-5" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-amber-950 font-sans">
                Pembayaran DP Belum Selesai
              </h3>
              <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-mono">
                Menunggu DP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-sans">
              Segera selesaikan pembayaran Down Payment (DP) sebesar{" "}
              <strong className="font-bold text-amber-950 font-mono">{formatRupiah(dpAmount)}</strong>{" "}
              agar slot lapangan terkunci dan tiket resmi terbit.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <Button
            onClick={handleResumePayment}
            isLoading={isResuming}
            disabled={isResuming || isCancelling}
            className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs gap-2"
          >
            <CreditCard className="size-4" />
            <span>Bayar Sekarang (Stripe Checkout)</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsCancelDialogOpen(true)}
            disabled={isResuming || isCancelling}
            className="sm:w-auto h-11 px-4 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border-red-200/80 rounded-xl transition-colors cursor-pointer gap-2"
          >
            <XCircle className="size-4" />
            <span>Batalkan Reservasi</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Reservasi Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Slot jam main yang sudah kamu tahan akan langsung dilepas kembali dan tersedia untuk pemain lain. Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Kembali</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {isCancelling ? "Membatalkan..." : "Ya, Batalkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
