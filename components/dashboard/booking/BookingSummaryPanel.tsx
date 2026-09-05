"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CreditCard, Tag, ShieldCheck, ChevronRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Court } from "@/components/dashboard/CustomerBookingWorkspace";

interface BookingSummaryPanelProps {
  activeCourt: Court | null;
  selectedDate: string;
  selectedTimeSlots: string[];
  totalPrice: number;
  dpAmount: number;
  remainingCash: number;
  voucherCode: string;
  onVoucherChange: (code: string) => void;
  onOpenPreview: () => void;
  isLoading: boolean;
}

export function BookingSummaryPanel({
  activeCourt,
  selectedDate,
  selectedTimeSlots,
  totalPrice,
  dpAmount,
  remainingCash,
  voucherCode,
  onVoucherChange,
  onOpenPreview,
  isLoading,
}: BookingSummaryPanelProps) {
  const t = useTranslations("dashboard.bookingFlow");
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6 sticky top-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-zinc-950" />
          <h3 className="font-extrabold text-base text-zinc-950 font-sans">{t("summaryTitle")}</h3>
        </div>
        <span className="text-[0.6875rem] font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md font-sans">
          {t("stripeBadge")}
        </span>
      </div>

      {activeCourt && selectedTimeSlots.length > 0 ? (
        <div className="space-y-5">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("courtLabel")}</span>
              <span className="font-bold text-zinc-950">
                {activeCourt.name} ({activeCourt.type})
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("dateLabel")}</span>
              <span className="font-semibold text-zinc-800">
                {format(new Date(selectedDate), "dd MMM yyyy", { locale: id })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("durationLabel")}</span>
              <span className="font-bold text-zinc-950">
                {t("durationValue", { count: selectedTimeSlots.length })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("totalLabel")}</span>
              <span className="font-extrabold text-zinc-950 tabular-nums">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Voucher Code Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">
              {t("voucherLabel")}
            </label>
            <div className="relative">
              <Tag className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={t("voucherPlaceholder")}
                value={voucherCode}
                onChange={(e) => onVoucherChange(e.target.value.toUpperCase())}
                className="h-10 pl-8 text-sm uppercase bg-zinc-50 border-zinc-200 rounded-xl font-sans"
              />
            </div>
          </div>

          {/* DP 50% Highlight Card */}
          <div className="p-4 bg-zinc-950 text-white rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5 font-sans">
                <ShieldCheck className="size-4 text-emerald-400" />
                {t("dpTitle")}
              </span>
              <span className="text-lg font-extrabold text-emerald-400 tabular-nums">
                Rp {dpAmount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-300 pt-2 border-t border-zinc-800 font-sans">
              <span>{t("cashRemaining")}</span>
              <span className="font-bold text-zinc-200 tabular-nums">
                Rp {remainingCash.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <Button
            onClick={onOpenPreview}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-12 text-sm rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>{t("payButton")}</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-zinc-400 space-y-3">
          <div className="size-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="font-bold text-zinc-700">{t("emptyTitle")}</p>
            <p className="text-sm text-zinc-500 mt-1 max-w-48 mx-auto">
              {t("emptyDesc")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
