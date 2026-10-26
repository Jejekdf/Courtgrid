"use client";

import { format } from "date-fns";
import { CreditCard, Tag, ShieldCheck, ChevronRight, Clock, CheckCircle2, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getDateFnsLocale, formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Court } from "@/components/dashboard/CustomerBookingWorkspace";

interface BookingSummaryPanelProps {
  activeCourt: Court | null;
  selectedDate: string;
  selectedTimeSlots: string[];
  totalPrice: number;
  originalTotalPrice?: number;
  dpAmount: number;
  remainingCash: number;
  voucherCode: string;
  onVoucherChange: (code: string) => void;
  onOpenPreview: () => void;
  isLoading: boolean;
  hideActionOnMobile?: boolean;
  appliedVoucher?: {
    code: string;
    discountPct: number;
    discountAmount: number;
    finalTotalPrice: number;
  } | null;
  onApplyVoucher?: () => void;
  onRemoveVoucher?: () => void;
  isValidatingVoucher?: boolean;
  voucherError?: string | null;
  isContiguous?: boolean;
}

export function BookingSummaryPanel({
  activeCourt,
  selectedDate,
  selectedTimeSlots,
  totalPrice,
  originalTotalPrice,
  dpAmount,
  remainingCash,
  voucherCode,
  onVoucherChange,
  onOpenPreview,
  isLoading,
  hideActionOnMobile = false,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  isValidatingVoucher = false,
  voucherError,
  isContiguous = true,
}: BookingSummaryPanelProps) {
  const t = useTranslations("dashboard.bookingFlow");
  const locale = useLocale();

  const subtotal = originalTotalPrice ?? totalPrice;

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 xl:p-6 shadow-xs space-y-4 xl:space-y-5 sticky top-4 xl:top-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 xl:pb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-zinc-950" aria-hidden="true" />
          <h3 className="font-extrabold text-base xl:text-lg text-zinc-950 text-balance">{t("summaryTitle")}</h3>
        </div>
        <span className="text-xs font-semibold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md font-sans">
          {t("stripeBadge")}
        </span>
      </div>

      {activeCourt && selectedTimeSlots.length > 0 ? (
        <div className="space-y-4 xl:space-y-5">
          <div className="space-y-2 xl:space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("courtLabel")}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-950">{activeCourt.name}</span>
                <span className="text-xs font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                  {activeCourt.type}
                </span>
              </div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("dateLabel")}</span>
              <span className="font-semibold text-zinc-800">
                {format(new Date(selectedDate), "dd MMM yyyy", { locale: getDateFnsLocale(locale) })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
              <span className="text-zinc-500">{t("durationLabel")}</span>
              <span className="font-bold text-zinc-950">
                {t("durationValue", { count: selectedTimeSlots.length })}
              </span>
            </div>

            {appliedVoucher ? (
              <>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
                  <span className="text-zinc-500">{t("subtotalHours", { count: selectedTimeSlots.length })}</span>
                  <span className="font-semibold text-zinc-700 tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans text-emerald-600">
                  <span className="font-medium">{t("voucherDiscountLabel", { pct: appliedVoucher.discountPct })}</span>
                  <span className="font-bold tabular-nums">
                    -{formatRupiah(appliedVoucher.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
                  <span className="text-zinc-500">{t("totalLabel")}</span>
                  <span className="font-extrabold text-zinc-950 tabular-nums">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1.5 border-b border-zinc-100 font-sans">
                <span className="text-zinc-500">{t("totalLabel")}</span>
                <span className="font-extrabold text-zinc-950 tabular-nums">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">
              {t("voucherLabel")}
            </label>
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold font-sans">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>{t("voucherActiveText", { code: appliedVoucher.code, pct: appliedVoucher.discountPct })}</span>
                </div>
                <button
                  type="button"
                  onClick={onRemoveVoucher}
                  className="text-xs text-zinc-500 hover:text-red-600 font-medium px-2 py-1 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="size-3" />
                  <span>{t("removeVoucherBtn")}</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <Input
                      placeholder={t("voucherPlaceholder")}
                      aria-label={t("voucherLabel")}
                      autoComplete="off"
                      spellCheck={false}
                      value={voucherCode}
                      onChange={(e) => onVoucherChange(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onApplyVoucher?.();
                        }
                      }}
                      className="h-10 pl-8 text-sm uppercase bg-zinc-50 border-zinc-200 rounded-xl font-sans"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onApplyVoucher}
                    disabled={!voucherCode.trim() || isValidatingVoucher}
                    isLoading={isValidatingVoucher}
                    className="h-10 px-3 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    {t("applyVoucherBtn")}
                  </Button>
                </div>
                {voucherError && (
                  <p className="text-xs text-red-600 font-sans mt-1.5">{voucherError}</p>
                )}
              </div>
            )}
          </div>

          <div className="p-3.5 xl:p-4 bg-zinc-950 text-white rounded-xl space-y-2.5 xl:space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-1.5 font-sans">
                <ShieldCheck className="size-4 text-emerald-400" />
                {t("dpTitle")}
              </span>
              <span className="text-base sm:text-lg xl:text-xl font-extrabold text-emerald-400 tabular-nums whitespace-nowrap">
                {formatRupiah(dpAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-300 pt-2 border-t border-zinc-800 font-sans">
              <span>{t("cashRemaining")}</span>
              <span className="font-bold text-zinc-200 tabular-nums whitespace-nowrap">
                {formatRupiah(remainingCash)}
              </span>
            </div>
          </div>

          {!isContiguous && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold text-center">
              {t("nonContiguousHint")}
            </div>
          )}

          <Button
            onClick={onOpenPreview}
            isLoading={isLoading}
            disabled={isLoading || !isContiguous}
            className={`w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 xl:h-12 text-sm xl:text-base rounded-xl shadow-md cursor-pointer transition-colors items-center justify-center gap-2 ${
              hideActionOnMobile ? "hidden lg:flex" : "flex"
            }`}
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
