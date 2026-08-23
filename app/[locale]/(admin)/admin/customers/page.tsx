"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "react-use";
import { adminDeleteCustomer, getAdminPaginatedCustomersAction } from "@/features/admin/actions";
import { Search, Trash2, CalendarCheck, Mail } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
import { useTranslations } from "next-intl";

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState("search", adminCustomersParsers.search.withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", adminCustomersParsers.page.withOptions({ shallow: true }));
  const [searchDraft, setSearchDraft] = useState(search);
  const [lastUrlSearch, setLastUrlSearch] = useState(search);
  if (lastUrlSearch !== search) {
    setLastUrlSearch(search);
    setSearchDraft(search);
  }
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string | null } | null>(null);

  // Debounce search query changes by 300ms
  useDebounce(
    () => {
      if (searchDraft !== search) {
        setSearch(searchDraft || null);
        setPage(1);
      }
    },
    300,
    [searchDraft, search, setSearch, setPage]
  );

  const { data, isPending, isFetching } = useQuery({
    queryKey: adminKeys.customers(search, page),
    queryFn: () => getAdminPaginatedCustomersAction(search, page, 10),
    placeholderData: keepPreviousData,
  });

  const customers: Customer[] = data?.customers ?? [];
  const totalPages = data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminDeleteCustomer(userId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: adminKeys.customersAll() });
      }
    },
  });

  const handleDelete = (userId: string, name: string | null) => {
    setPendingDelete({ id: userId, name });
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-2.5">
            {t("title")}
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {t("desc")}
          </p>
        </div>

        <div className="w-full md:w-72">
          <div className="relative">
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={t("searchPlaceholder")}
              containerClassName="w-full"
              leftIcon={<Search className="size-4 text-zinc-400" />}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                      Rp {user.totalSpent.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {user.lastBookingAt ? format(new Date(user.lastBookingAt), "dd MMM yyyy", { locale: id }) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
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
          <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-200 flex items-center justify-between">
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
