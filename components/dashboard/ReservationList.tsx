
"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useMutation } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "react-use";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard.reservations");
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
    onError: () => toast.error(t("cancelErrorToast")),
  });

  const handleCopyId = (id: string) => {
    copyToClipboard(id);
    setCopiedId(id);
    toast.success(t("copiedToast"));
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
        <div className="size-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
          <QrCode className="size-6" />
        </div>
        <div>
          <p className="font-bold text-zinc-950 text-sm">{t("emptyTitle")}</p>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto mt-1 font-mono">
            {t("emptyDesc")}
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
                <th className="px-5 py-4">{t("colCourt")}</th>
                <th className="px-5 py-4">{t("colDate")}</th>
                <th className="px-5 py-4">{t("colTime")}</th>
                <th className="px-5 py-4">{t("colStatus")}</th>
                <th className="px-5 py-4">{t("colPayment")}</th>
                <th className="px-5 py-4 text-right">{t("colTotal")}</th>
                <th className="px-5 py-4 text-right">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-zinc-400 font-mono"
                  >
                    {t("noFilterMatch")}
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
            <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBack")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingCancelId) cancelMutation.mutate(pendingCancelId);
                setIsCancelDialogOpen(false);
              }}
            >
              {t("cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
