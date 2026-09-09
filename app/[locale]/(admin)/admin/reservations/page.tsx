"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getAllReservations, adminDeleteReservation } from "@/features/admin/actions";
import { format } from "date-fns";
import { Printer, Filter, ShieldCheck, Download } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
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
import { adminKeys } from "@/lib/query-keys";
import { adminReservationsParsers } from "@/lib/search-params";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAdminReservationsActions } from "@/stores/useBoundStore";
import { ReservationRow, type ReservationRowData } from "@/components/admin/reservations/ReservationRow";
import { ReservationCard } from "@/components/admin/reservations/ReservationCard";

export default function AdminReservationsPage() {
  const t = useTranslations("admin.reservations");
  const queryClient = useQueryClient();
  const [filter, setFilter] = useQueryState("filter", adminReservationsParsers.filter.withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", adminReservationsParsers.page.withOptions({ shallow: true }));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { openScanner } = useAdminReservationsActions();

  // Fetch reservations matching current filter and page
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...adminKeys.reservations(filter), page],
    queryFn: async () => {
      const res = await getAllReservations(filter, page, 10);
      const list = Array.isArray(res) ? res : res?.reservations || [];
      return { reservations: list as unknown as ReservationRowData[], totalPages: !Array.isArray(res) ? res?.totalPages ?? 1 : 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 10000,
  });

  const reservations = data?.reservations ?? [];
  const totalPages = data?.totalPages ?? 1;

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const displayedReservations = reservations.filter((res) => {
    if (statusFilter === "ALL") return true;
    return res.status === statusFilter;
  });

  // Mutation for deleting reservation and invalidating cache
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteReservation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(t("deletedToast", { id: id.slice(0, 8) }));
    },
  });

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (displayedReservations.length === 0) {
      toast.error(t("exportEmptyToast"));
      return;
    }
    const headers = [
      "ID Reservasi",
      "Pelanggan",
      "Email",
      "Arena",
      "Tanggal",
      "Jam Mulai",
      "Jam Selesai",
      "Total (Rp)",
      "DP (Rp)",
      "Status Reservasi",
      "Status Pembayaran",
    ];
    const rows = displayedReservations.map((r) => [
      r.id,
      r.user?.name ?? "-",
      r.user?.email ?? "-",
      r.court?.name ?? "-",
      r.date ? format(new Date(r.date), "yyyy-MM-dd") : "-",
      r.startTime,
      r.endTime,
      r.totalPrice,
      r.payment?.dpAmount ?? 0,
      r.status,
      r.payment?.status ?? "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `reservasi-courtgrid-${filter}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("exportSuccessToast"));
  };

  return (
    <div className="w-full space-y-8 text-zinc-950">
      {/* Reusable Admin Header Component */}
      <div className="print:hidden">
        <AdminHeader
          title={t("title")}
          description={t("desc")}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={openScanner}
                className="px-3.5 py-2 min-h-10 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="size-4" />
                <span>{t("verifyTicketBtn")}</span>
              </button>
              <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-2 min-h-10 shadow-xs">
                <Filter className="size-3.5 text-zinc-400 mr-1.5" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as "daily" | "monthly" | "all");
                    setPage(1);
                  }}
                  className="bg-transparent text-xs sm:text-sm text-zinc-950 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="all">{t("filterAllTime")}</option>
                  <option value="daily">{t("filterToday")}</option>
                  <option value="monthly">{t("filterMonthly")}</option>
                </select>
              </div>
              <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-2 min-h-10 shadow-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-zinc-950 font-medium focus:outline-hidden cursor-pointer"
                  aria-label={t("filterStatus")}
                >
                  <option value="ALL">{t("allStatus")}</option>
                  <option value="PENDING">{t("statusPending")}</option>
                  <option value="DP_PAID">{t("statusDpPaid")}</option>
                  <option value="DONE">{t("statusDone")}</option>
                  <option value="CANCELED">{t("statusCanceled")}</option>
                </select>
              </div>
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 min-h-10 text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <Download className="size-4 text-zinc-500" />
                <span>{t("exportCsv")}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 min-h-10 text-xs sm:text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Printer className="size-4" />
                <span>{t("printReport")}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Report Section */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden print:shadow-none print:border-none print:p-0">
        <div className="hidden print:block mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-950 uppercase">CourtGrid Official Report</h2>
          <p className="text-sm text-zinc-500">{t("reportPeriod", { period: filter.toUpperCase() })}</p>
        </div>

        {/* Card view for mobile and tablet (< 1024px) */}
        <div className="block lg:hidden print:hidden divide-y divide-zinc-100">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-zinc-500 font-mono">
              {t("loading")}
            </div>
          ) : displayedReservations.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 font-mono">
              {t("empty")}
            </div>
          ) : (
            displayedReservations.map((res) => (
              <ReservationCard
                key={res.id}
                reservation={res}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Desktop table — 1024px+ where content area is wide enough */}
        <div className="hidden lg:block print:block overflow-x-auto">
          <table className="w-full text-left text-sm print:text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-xs uppercase font-mono tracking-wider text-zinc-500 font-semibold print:bg-transparent">
              <tr>
                <th className="px-6 py-4 print:px-2">{t("colIdDate")}</th>
                <th className="px-6 py-4 print:px-2">{t("colCustomer")}</th>
                <th className="px-6 py-4 print:px-2">{t("colCourtTime")}</th>
                <th className="px-6 py-4 print:px-2">{t("colTotal")}</th>
                <th className="px-6 py-4 print:px-2">{t("colPaymentStatus")}</th>
                <th className="px-6 py-4 print:hidden text-right">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">
                    {t("loading")}
                  </td>
                </tr>
              ) : displayedReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                displayedReservations.map((res) => (
                  <ReservationRow
                    key={res.id}
                    reservation={res}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-white border border-zinc-200 rounded-xl shadow-xs">
          <div className="text-sm text-zinc-500">
            {t("pageOf", { page, total: totalPages })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="min-h-10 px-3.5"
            >
              {t("prevBtn")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="min-h-10 px-3.5"
            >
              {t("nextBtn")}
            </Button>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDeleteId) deleteMutation.mutate(pendingDeleteId);
                setIsDeleteDialogOpen(false);
              }}
            >
              {t("deleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
