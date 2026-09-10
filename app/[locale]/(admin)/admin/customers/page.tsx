"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "@react-hookz/web";
import { adminDeleteCustomer, getAdminPaginatedCustomersAction } from "@/features/admin/actions";
import { Search, Trash2, CalendarCheck, Mail, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { adminCustomersParsers } from "@/lib/search-params";
import { useTranslations, useLocale } from "next-intl";
import { getDateFnsLocale, formatRupiah } from "@/lib/utils";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
};

export default function AdminCustomersPage() {
  const t = useTranslations("admin.customers");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState("search", adminCustomersParsers.search.withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", adminCustomersParsers.page.withOptions({ shallow: true }));
  const [prevSearch, setPrevSearch] = useState(search);
  const [searchDraft, setSearchDraft] = useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchDraft(search);
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string | null } | null>(null);

  const debouncedSetSearch = useDebouncedCallback(
    (value: string) => {
      setSearch(value || null);
      setPage(1);
    },
    [setSearch, setPage],
    300
  );

  const { data, isPending, isFetching } = useQuery({
    queryKey: adminKeys.customers(search, page),
    queryFn: () => getAdminPaginatedCustomersAction(search, page, 10),
    placeholderData: keepPreviousData,
  });

  const customers: Customer[] = data?.customers ?? [];
  const totalPages = data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await adminDeleteCustomer(userId);
      if (!result.success) {
        throw new Error(result.error || t("deleteFailedToast"));
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.customersAll() });
      toast.success(t("deletedToast"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("deleteFailedToast"));
    },
  });

  const handleDelete = (userId: string, name: string | null) => {
    setPendingDelete({ id: userId, name });
    setIsDeleteDialogOpen(true);
  };

  const handleExportCsv = () => {
    if (customers.length === 0) {
      toast.error(t("exportEmptyToast"));
      return;
    }
    const headers = [
      "ID Pelanggan",
      "Nama",
      "Email",
      "Total Booking",
      "Total Pengeluaran (Rp)",
      "Booking Terakhir",
    ];
    const rows = customers.map((c) => [
      c.id,
      c.name ?? "-",
      c.email ?? "-",
      c.totalBookings,
      c.totalSpent,
      c.lastBookingAt ? format(new Date(c.lastBookingAt), "yyyy-MM-dd HH:mm") : "-",
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
      `pelanggan-courtgrid-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("exportSuccessToast"));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 text-balance">
            {t("title")}
          </h1>
          <p className="text-zinc-500 mt-1 text-sm text-pretty">
            {t("desc")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-72">
            <Input
              value={searchDraft}
              onChange={(e) => {
                const val = e.target.value;
                setSearchDraft(val);
                debouncedSetSearch(val);
              }}
              placeholder={t("searchPlaceholder")}
              containerClassName="w-full"
              leftIcon={<Search className="size-4 text-zinc-400" />}
              className="h-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="w-full sm:w-auto min-h-10 px-3.5 text-xs font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
          >
            <Download className="size-4 text-zinc-500" />
            <span>{t("exportCsv")}</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Card view for mobile and tablet (< 1024px) */}
        <div className="block lg:hidden divide-y divide-zinc-100">
          {isPending ? (
            <div className="px-6 py-12 text-center text-xs text-zinc-500 font-mono">
              {t("loading")}
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-12 text-center text-xs text-zinc-500 font-mono bg-zinc-50/50">
              {search ? t("emptySearch") : t("empty")}
            </div>
          ) : (
            customers.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-zinc-100 border border-zinc-200 font-bold text-zinc-700 flex items-center justify-center text-xs shrink-0">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-950 leading-tight">
                        {user.name || t("noName")}
                      </h4>
                      <span className="text-[0.6875rem] text-zinc-400 font-mono block">
                        ID: {user.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="size-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer shrink-0"
                    aria-label={t("deleteAria")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono">
                  <Mail className="size-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="bg-zinc-50/70 border border-zinc-100 rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{t("colSpent")}</span>
                    <span className="font-bold text-zinc-950 font-mono">
                      {formatRupiah(user.totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[0.6875rem] text-zinc-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-zinc-700">
                      <CalendarCheck className="size-3 text-emerald-600" />
                      {t("bookingsCount", { count: user.totalBookings })}
                    </span>
                    <span>
                      {t("colLastBooking")}: {user.lastBookingAt ? format(new Date(user.lastBookingAt), "dd MMM yyyy", { locale: getDateFnsLocale(locale) }) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table — 1024px+ */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-500">
              <tr>
                <th className="px-6 py-4">{t("colCustomer")}</th>
                <th className="px-6 py-4">{t("colEmail")}</th>
                <th className="px-6 py-4">{t("colBookings")}</th>
                <th className="px-6 py-4">{t("colSpent")}</th>
                <th className="px-6 py-4">{t("colLastBooking")}</th>
                <th className="px-6 py-4 text-center">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isPending ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    {t("loading")}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 bg-zinc-50/50">
                    {search ? t("emptySearch") : t("empty")}
                  </td>
                </tr>
              ) : (
                customers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-zinc-100 border border-zinc-200 font-bold text-zinc-700 flex items-center justify-center text-xs">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-950">{user.name || t("noName")}</div>
                          <div className="text-xs text-zinc-400 font-mono">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-zinc-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        <CalendarCheck className="size-3 text-emerald-600" />
                        {t("bookingsCount", { count: user.totalBookings })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 font-medium">
                      {formatRupiah(user.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {user.lastBookingAt ? format(new Date(user.lastBookingAt), "dd MMM yyyy", { locale: getDateFnsLocale(locale) }) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="min-h-9 min-w-9 p-2 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                          aria-label={t("deleteAria")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
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
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDesc", { name: pendingDelete?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              {t("deleteConfirmBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
