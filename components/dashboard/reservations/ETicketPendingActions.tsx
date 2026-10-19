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
import { useTranslations } from "next-intl";

interface ETicketPendingActionsProps {
  reservationId: string;
  dpAmount: number;
}

export default function ETicketPendingActions({
  reservationId,
  dpAmount,
}: ETicketPendingActionsProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.reservations");
  const [isResuming, setIsResuming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleResumePayment = async () => {
    setIsResuming(true);
    try {
      const result = await resumeReservationPaymentAction(reservationId);
      if (result.success && result.url) {
        toast.success(t("stripeRedirectToast"));
        window.location.href = result.url;
      } else {
        toast.error(result.error || t("resumePaymentError"));
      }
    } catch {
      toast.error(t("networkErrorToast"));
    } finally {
      setIsResuming(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelReservationAction({ reservationId });
      if (result.success) {
        toast.success(result.message || t("cancelSuccessToast"));
        setIsCancelDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || t("cancelErrorToast"));
      }
    } catch {
      toast.error(t("cancelErrorToast"));
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
                {t("pendingPaymentTitle")}
              </h3>
              <span className="text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-mono">
                {t("statusPending")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-sans">
              {t("pendingPaymentDesc", { amount: formatRupiah(dpAmount) })}
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
            <span>{t("payNowStripe")}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsCancelDialogOpen(true)}
            disabled={isResuming || isCancelling}
            className="sm:w-auto h-11 px-4 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border-red-200/80 rounded-xl transition-colors cursor-pointer gap-2"
          >
            <XCircle className="size-4" />
            <span>{t("cancelBtn")}</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t("cancelBack")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {isCancelling ? t("cancelling") : t("cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
