"use client";

import { useState } from "react";
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string | null } | null>(null);

  // Debounce search query changes by 300ms (react-use, same as CourtCatalog).
  useDebounce(
    () => {
      setDebouncedSearch(search);
    },
    300,
    [search]
  );

  const { data, isPending, isFetching } = useQuery({
    queryKey: adminKeys.customers(debouncedSearch, page),
    queryFn: () => getAdminPaginatedCustomersAction(debouncedSearch, page, 10),
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
            Manajemen Pelanggan
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Pantau dan kelola data akun pelanggan terdaftar di platform CourtGrid.
          </p>
        </div>

        <div className="w-full md:w-72">
          <div className="relative">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama atau email..."
              containerClassName="w-full"
              leftIcon={<Search className="w-4 h-4 text-zinc-400" />}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-semibold text-zinc-500">
              <tr>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Total Booking</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Terakhir Booking</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isPending ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 bg-zinc-50/50">
                    {search ? "Tidak ditemukan pelanggan dengan kata kunci tersebut." : "Belum ada pelanggan terdaftar."}
                  </td>
                </tr>
              ) : (
                customers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 font-bold text-zinc-700 flex items-center justify-center text-xs">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-950">{user.name || "Tanpa Nama"}</div>
                          <div className="text-xs text-zinc-400 font-mono">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        <CalendarCheck className="w-3 h-3 text-emerald-600" />
                        {user.totalBookings} Booking
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
                          aria-label="Hapus Akun Pelanggan"
                        >
                          <Trash2 className="w-4 h-4" />
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
              Halaman <span className="font-semibold text-zinc-950">{page}</span> dari{" "}
              <span className="font-semibold text-zinc-950">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pelanggan {pendingDelete?.name || "ini"}? Seluruh riwayat reservasi pelanggan ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
