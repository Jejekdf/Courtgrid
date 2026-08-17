"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getAllReservations, adminDeleteReservation } from "@/features/admin/actions";
import { format } from "date-fns";
import { Printer, Filter, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { adminKeys } from "@/lib/query-keys";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"daily" | "monthly" | "all">("all");
  const [page, setPage] = useState(1);

  // TanStack Query Integration for Admin Reservations
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

  // Mutation for deleting reservation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteReservation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(`Reservasi ${id.slice(0, 8)} berhasil dihapus.`);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus reservasi/status pending ini dari database?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-zinc-950">
      {/* Reusable Admin Header Component */}
      <div className="print:hidden">
        <AdminHeader
          title="Reservasi"
          description="Pantau seluruh riwayat sewa arena, cetak laporan resmi, dan lakukan pembersihan data pending."
          actions={
            <div className="flex items-center space-x-3">
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
                  <option value="all">Semua Waktu</option>
                  <option value="daily">Hari Ini</option>
                  <option value="monthly">Bulan Ini</option>
                </select>
              </div>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Report Section */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden print:shadow-none print:border-none print:p-0">
        <div className="hidden print:block mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-950 uppercase">CourtGrid Official Report</h2>
          <p className="text-sm text-zinc-500">Laporan Reservasi Lapangan — Periode: {filter.toUpperCase()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs print:text-xs">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-[11px] uppercase font-mono tracking-wider text-zinc-500 print:bg-transparent">
              <tr>
                <th className="px-4 py-3 print:px-2">ID & Tanggal</th>
                <th className="px-4 py-3 print:px-2">Pelanggan</th>
                <th className="px-4 py-3 print:px-2">Lapangan & Jam</th>
                <th className="px-4 py-3 print:px-2">Total Harga</th>
                <th className="px-4 py-3 print:px-2">Status Pembayaran</th>
                <th className="px-4 py-3 print:hidden text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-zinc-400">
                    Memuat data reservasi...
                  </td>
                </tr>
              ) : !Array.isArray(reservations) || reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-zinc-400">
                    Tidak ada data reservasi untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors print:hover:bg-transparent">
                    <td className="px-4 py-3.5 print:px-2 text-zinc-700">
                      <div className="text-[11px] text-zinc-400 font-mono mb-0.5">{res.id.slice(0,8)}</div>
                      <div className="font-semibold text-zinc-950">{res.date ? format(new Date(res.date), "dd MMM yyyy") : "-"}</div>
                    </td>
                    <td className="px-4 py-3.5 print:px-2">
                      <div className="font-semibold text-zinc-950">{res.user?.name || "Pelanggan Hapus"}</div>
                      <div className="text-xs text-zinc-400">{res.user?.email || "-"}</div>
                    </td>
                    <td className="px-4 py-3.5 print:px-2 text-zinc-700">
                      <div className="font-semibold text-zinc-950">{res.court?.name || "Lapangan"}</div>
                      <div className="text-xs text-zinc-400 font-mono">{res.startTime} - {res.endTime} WIB</div>
                    </td>
                    <td className="px-4 py-3.5 print:px-2 font-semibold text-zinc-950">
                      Rp {res.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 print:px-2">
                      {res.status === "DP_PAID" || res.payment?.status === "VERIFIED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          DP PAID (Stripe)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {res.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 print:hidden text-right">
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                        title="Hapus data reservasi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
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

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
