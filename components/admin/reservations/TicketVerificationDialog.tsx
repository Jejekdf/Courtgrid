"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  Receipt,
  Calendar,
  Clock,
  User,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminScanTicket, adminCheckInReservation } from "@/features/admin/actions";
import { formatRupiah, safeFormatDate } from "@/lib/utils";

type ScannedTicket = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string; type?: string } | null;
  payment: { dpAmount?: number; status?: string } | null;
};

interface TicketVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInSuccess: () => void;
}

export function TicketVerificationDialog({
  isOpen,
  onOpenChange,
  onCheckInSuccess,
}: TicketVerificationDialogProps) {
  const t = useTranslations("admin.reservations");
  const [ticketId, setTicketId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<ScannedTicket | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketId.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setScannedTicket(null);

    try {
      const res = await adminScanTicket(ticketId.trim());
      if (res.success && res.reservation) {
        setScannedTicket(res.reservation as ScannedTicket);
      } else {
        setSearchError(res.error || t("ticketNotFound"));
      }
    } catch {
      setSearchError(t("ticketNotFound"));
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scannedTicket) return;
    setIsCheckingIn(true);
    try {
      const res = await adminCheckInReservation(scannedTicket.id);
      if (res.success) {
        toast.success(res.message || t("checkInSuccess"));
        setScannedTicket((prev) => (prev ? { ...prev, status: "DONE" } : null));
        onCheckInSuccess();
      } else {
        toast.error(res.error || t("checkInFailed"));
      }
    } catch {
      toast.error(t("checkInFailed"));
    } finally {
      setIsCheckingIn(false);
    }
  };

  const resetDialog = () => {
    setTicketId("");
    setScannedTicket(null);
    setSearchError(null);
  };

  const dpAmount = scannedTicket?.payment?.dpAmount ?? (scannedTicket ? Math.round(scannedTicket.totalPrice * 0.5) : 0);
  const remainingAmount = scannedTicket ? Math.max(0, scannedTicket.totalPrice - dpAmount) : 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetDialog();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span>{t("verifyTicketTitle")}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {t("verifyTicketDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 mt-2">
          <Input
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder={t("ticketInputPlaceholder")}
            containerClassName="flex-1"
            leftIcon={<Search className="size-4 text-zinc-400" />}
          />
          <Button
            type="submit"
            size="sm"
            isLoading={isSearching}
            disabled={!ticketId.trim() || isSearching}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
          >
            {t("searchBtn")}
          </Button>
        </form>

        {/* Search Error */}
        {searchError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Ticket Details Preview */}
        {scannedTicket && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4 text-sm mt-1">
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-zinc-950">
                  <Receipt className="size-4 text-zinc-500" />
                  <span>{scannedTicket.court?.name ?? t("unknownCourt")}</span>
                </div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  ID: #{scannedTicket.id.slice(0, 12)}
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider ${
                  scannedTicket.status === "DONE"
                    ? "bg-zinc-200 text-zinc-700 border border-zinc-300"
                    : scannedTicket.status === "DP_PAID"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {scannedTicket.status === "DONE"
                  ? t("statusDone")
                  : scannedTicket.status === "DP_PAID"
                  ? t("dpPaidBadge")
                  : scannedTicket.status}
              </span>
            </div>

            {/* Customer & Schedule Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 uppercase font-semibold">{t("customerLabel")}</span>
                <div className="font-semibold text-zinc-950 flex items-center gap-1">
                  <User className="size-3 text-zinc-400" />
                  <span>{scannedTicket.user?.name || "Pelanggan"}</span>
                </div>
                <div className="text-zinc-500">{scannedTicket.user?.email || "-"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 uppercase font-semibold">{t("scheduleLabel")}</span>
                <div className="font-semibold text-zinc-950 flex items-center gap-1">
                  <Calendar className="size-3 text-zinc-400" />
                  <span>{safeFormatDate(scannedTicket.date, "dd MMM yyyy")}</span>
                </div>
                <div className="text-zinc-600 font-mono flex items-center gap-1">
                  <Clock className="size-3 text-zinc-400" />
                  <span>{scannedTicket.startTime} - {scannedTicket.endTime} WIB</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t("totalLabel")}</span>
                <span className="font-semibold text-zinc-950">{formatRupiah(scannedTicket.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t("dpPaidLabel")}</span>
                <span className="font-semibold text-emerald-600">{formatRupiah(dpAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-100 font-bold">
                <span className="text-zinc-700">{t("payOnsiteLabel")}</span>
                <span className="text-zinc-950 text-sm">{formatRupiah(remainingAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/admin/eticket/${scannedTicket.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-950 transition-colors font-medium"
              >
                <span>{t("viewFullTicket")}</span>
                <ArrowUpRight className="size-3" />
              </Link>

              {scannedTicket.status === "DONE" ? (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>{t("alreadyCheckedIn")}</span>
                </div>
              ) : scannedTicket.status === "DP_PAID" ? (
                <Button
                  size="sm"
                  onClick={handleCheckIn}
                  isLoading={isCheckingIn}
                  disabled={isCheckingIn}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  leftIcon={<CheckCircle2 className="size-3.5" />}
                >
                  {t("confirmCheckInBtn")}
                </Button>
              ) : (
                <span className="text-xs text-amber-600 font-medium">{t("cannotCheckInPending")}</span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
