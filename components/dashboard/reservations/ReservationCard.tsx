"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { safeFormatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowUpRight, Copy, Check, CreditCard, Calendar, Clock } from "lucide-react";
import type { ReservationRow } from "@/components/dashboard/ReservationList";
import { resumeReservationPaymentAction } from "@/features/reservations/actions";
import { ReservationStatusBadge, PaymentStatusBadge } from "./ReservationStatusBadge";

interface ReservationCardProps {
  reservation: ReservationRow;
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

export function ReservationCard({
  reservation: res,
  copiedId,
  onCopyId,
  onCancel,
  isCancelling,
}: ReservationCardProps) {
  const t = useTranslations("dashboard.reservations");
  const [isResuming, setIsResuming] = useState(false);
  const payStatus = res.payment?.status || "PENDING";
  const isVerified = res.status === "DP_PAID" || res.status === "DONE" || payStatus === "VERIFIED";

  const handleResumePayment = async () => {
    setIsResuming(true);
    try {
      const result = await resumeReservationPaymentAction(res.id);
      if (result.success && result.url) {
        toast.success(t("redirectToast"));
        window.location.href = result.url;
      } else {
        toast.error(result.error || t("resumePaymentError"));
      }
    } catch {
      toast.error(t("resumePaymentError"));
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs space-y-3.5">
      {/* Header: Court Name + Copy ID + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full shrink-0 ${
                isVerified
                  ? "bg-emerald-500"
                  : res.status === "PENDING"
                  ? "bg-amber-500"
                  : "bg-zinc-300"
              }`}
            />
            <h4 className="font-bold text-zinc-950 text-base leading-tight">
              {res.court?.name}
            </h4>
            <button
              type="button"
              onClick={() => onCopyId(res.id)}
              className="p-2 min-h-11 min-w-11 -my-2 flex items-center justify-center text-zinc-400 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
              aria-label={t("copyId")}
            >
              {copiedId === res.id ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
          <span className="text-[0.6875rem] font-mono text-zinc-400 block">
            ID: {res.id.slice(0, 10)}...
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <ReservationStatusBadge status={res.status} />
          <PaymentStatusBadge isVerified={isVerified} reservationStatus={res.status} />
        </div>
      </div>

      {/* Schedule & Price Details */}
      <div className="bg-zinc-50/70 border border-zinc-100 rounded-xl p-3 flex items-center justify-between gap-3 text-xs sm:text-sm font-sans">
        <div className="space-y-1 text-zinc-700">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="size-3.5 text-zinc-400 shrink-0" />
            <span>{safeFormatDate(res.date, "dd MMM yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
            <Clock className="size-3.5 text-zinc-400 shrink-0" />
            <span>{res.startTime} - {res.endTime} WIB</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[0.6875rem] uppercase font-semibold text-zinc-400 block">Total</span>
          <span className="font-extrabold text-sm sm:text-base text-zinc-950 font-mono tabular-nums">
            Rp {new Intl.NumberFormat("id-ID").format(res.totalPrice)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex items-center gap-2">
        {res.status === "PENDING" && (
          <>
            <Button
              size="default"
              isLoading={isResuming}
              disabled={isResuming || isCancelling}
              onClick={handleResumePayment}
              className="flex-1 min-h-11 text-sm font-bold bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer shadow-xs"
              leftIcon={<CreditCard className="size-4" />}
            >
              {t("payNowBtn")}
            </Button>
            <Button
              variant="destructive"
              size="default"
              isLoading={isCancelling}
              disabled={isCancelling || isResuming}
              onClick={() => onCancel(res.id)}
              className="min-h-11 px-3.5 text-sm font-semibold rounded-xl cursor-pointer"
              leftIcon={<XCircle className="size-4" />}
            >
              {t("cancelBtn")}
            </Button>
          </>
        )}

        {isVerified && (
          <Link
            href={`/dashboard/reservations/${res.id}`}
            className="w-full min-h-11 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <span>{t("eticketBtn")}</span>
            <ArrowUpRight className="size-4" />
          </Link>
        )}

        {res.status === "CANCELED" && (
          <span className="w-full py-2 text-center text-xs font-mono text-zinc-400 bg-zinc-100 rounded-xl">
            {t("expiredBadge")}
          </span>
        )}
      </div>
    </div>
  );
}
