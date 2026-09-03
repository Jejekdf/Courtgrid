"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getAllReservations, adminDeleteReservation } from "@/features/admin/actions";
import { format } from "date-fns";
import { Printer, Filter, Trash2, ShieldCheck, ArrowUpRight } from "lucide-react";
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
import { TicketVerificationDialog } from "@/components/admin/reservations/TicketVerificationDialog";

type ReservationDetail = {
  id: string;
  user: { name: string | null; email: string | null } | null;
  court: { name: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  payment?: { status?: string; dpAmount?: number } | null;
};

export default function AdminReservationsPage() {
  const t = useTranslations("admin.reservations");
  const tDash = useTranslations("admin.dashboard");
  const queryClient = useQueryClient();
  const [filter, setFilter] = useQueryState("filter", adminReservationsParsers.filter.withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", adminReservationsParsers.page.withOptions({ shallow: true }));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Fetch reservations matching current filter and page
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...adminKeys.reservations(filter), page],
    queryFn: async () => {
      const res = await getAllReservations(filter, page, 10);
      const list = Array.isArray(res) ? res : res?.reservations || [];
      return { reservations: list as unknown as ReservationDetail[], totalPages: !Array.isArray(res) ? res?.totalPages ?? 1 : 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 10000,
  });

  const reservations = data?.reservations ?? [];
  const totalPages = data?.totalPages ?? 1;

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

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[88rem] mx-auto text-zinc-950">
      {/* Reusable Admin Header Component */}
      <div className="print:hidden">
        <AdminHeader
          title={t("title")}
          description={t("desc")}
          actions={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsVerifyOpen(true)}
                className="px-3.5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t("verifyTicketBtn")}</span>
              </button>
              <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 shadow-xs">
                <Filter className="h-3.5 w-3.5 text-zinc-400 mr-1.5" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as "daily" | "monthly" | "all");
                    setPage(1);
                  }}
                  className="bg-transparent text-sm text-zinc-950 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">{t("filterAllTime")}</option>
                  <option value="daily">{t("filterToday")}</option>
                  <option value="monthly">{t("filterMonthly")}</option>
                </select>
              </div>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <Printer className="h-3.5 w-3.5" />
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs print:text-xs">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-[0.6875rem] uppercase font-mono tracking-wider text-zinc-500 print:bg-transparent">
              <tr>
                <th className="px-4 py-3 print:px-2">{t("colIdDate")}</th>
                <th className="px-4 py-3 print:px-2">{t("colCustomer")}</th>
                <th className="px-4 py-3 print:px-2">{t("colCourtTime")}</th>
                <th className="px-4 py-3 print:px-2">{t("colTotal")}</th>
                <th className="px-4 py-3 print:px-2">{t("colPaymentStatus")}</th>
                <th className="px-4 py-3 print:hidden text-right">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-zinc-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : !Array.isArray(reservations) || reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-zinc-400">
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors print:hover:bg-transparent">
                    <td className="px-4 py-3.5 print:px-2 text-zinc-700">
                      <div className="text-[0.6875rem] text-zinc-400 font-mono mb-0.5">{res.id.slice(0,8)}</div>
                      <div className="font-semibold text-zinc-950">{res.date ? format(new Date(res.date), "dd MMM yyyy") : "-"}</div>
                    </td>
                    <td className="px-4 py-3.5 print:px-2">
                      <div className="font-semibold text-zinc-950">{res.user?.name || "Pelanggan Hapus"}</div>
                      <div className="text-xs text-zinc-400">{res.user?.email || "-"}</div>
                    </td>
                    <td className="px-4 py-3.5 print:px-2 text-zinc-700">
                      <div className="font-semibold text-zinc-950">{res.court?.name || tDash("defaultCourt")}</div>
                      <div className="text-xs text-zinc-400 font-mono">{res.startTime} - {res.endTime} WIB</div>
                    </td>
                    <td className="px-4 py-3.5 print:px-2 font-semibold text-zinc-950">
                      Rp {res.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 print:px-2">
                      {res.status === "DP_PAID" || res.payment?.status === "VERIFIED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t("dpPaidBadge")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {res.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 print:hidden text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/eticket/${res.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors"
                          title={t("viewTicketTitle")}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>{t("eticketBtn")}</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer font-semibold"
                          title={t("deleteBtnTitle")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("deleteBtn")}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
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
            >
              {t("prevBtn")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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

      {/* Ticket Verification & Check-in Dialog */}
      <TicketVerificationDialog
        isOpen={isVerifyOpen}
        onOpenChange={setIsVerifyOpen}
        onCheckInSuccess={() => queryClient.invalidateQueries({ queryKey: adminKeys.all })}
      />
    </div>
  );
}
