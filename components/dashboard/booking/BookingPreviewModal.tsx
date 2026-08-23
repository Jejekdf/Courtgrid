"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Court } from "@/components/dashboard/CustomerBookingWorkspace";

interface BookingPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeCourt: Court | null;
  selectedDate: string;
  selectedTimeSlots: string[];
  totalPrice: number;
  dpAmount: number;
  remainingCash: number;
  voucherCode: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export function BookingPreviewModal({
  isOpen,
  onOpenChange,
  activeCourt,
  selectedDate,
  selectedTimeSlots,
  totalPrice,
  dpAmount,
  remainingCash,
  voucherCode,
  onConfirm,
  isLoading,
}: BookingPreviewModalProps) {
  const t = useTranslations("dashboard.bookingFlow");
  if (!activeCourt || selectedTimeSlots.length === 0) return null;

  const sortedSlots = [...selectedTimeSlots].sort();
  const startSlot = sortedSlots[0];
  const lastSlot = sortedSlots[sortedSlots.length - 1];
  const endHour = (parseInt(lastSlot.split(":")[0], 10) + 1)
    .toString()
    .padStart(2, "0");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-zinc-950">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span>{t("previewTitle")}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {t("previewDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2.5 text-sm">
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500 font-mono">{t("courtLabel")}</span>
              <span className="font-bold text-zinc-950">
                {activeCourt.name} ({activeCourt.type})
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500 font-mono">{t("dateLabel")}</span>
              <span className="font-bold text-zinc-950 font-mono">
                {format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500 font-mono">{t("sessionLabel")}</span>
              <span className="font-mono font-bold text-zinc-950">
                {startSlot} - {`${endHour}:00`} WIB
              </span>
            </div>
            {voucherCode.trim() && (
              <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                <span className="text-zinc-500 font-mono">{t("voucherApplied")}</span>
                <span className="font-mono font-bold text-emerald-600">
                  {voucherCode.trim()}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-sm font-bold text-zinc-950">
              <span>{t("totalLabel")}</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="bg-zinc-950 text-white rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-emerald-400 font-mono">
              <span>{t("dpStripeLabel")}</span>
              <span>Rp {dpAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-zinc-300 pt-1 border-t border-zinc-800 font-mono">
              <span>{t("cashRemaining")}</span>
              <span className="font-bold text-zinc-200">
                Rp {remainingCash.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-sm cursor-pointer rounded-xl"
            >
              {t("backBtn")}
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              disabled={isLoading}
              className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm cursor-pointer rounded-xl"
            >
              {t("payNowBtn")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
