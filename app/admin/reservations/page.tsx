"use client";

import { useEffect, useState } from "react";
import { getAllReservations, adminDeleteReservation } from "@/actions/admin";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Printer, Filter, Trash2 } from "lucide-react";

type ReservationDetail = {
  id: string;
  user: { name: string | null; email: string | null };
  court: { name: string };
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  payment: any;
};

export default function AdminReservationsPage() {
  const [filter, setFilter] = useState<"daily" | "monthly" | "all">("all");
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, [filter]);

  async function loadReservations() {
    setIsLoading(true);
    const data = await getAllReservations(filter);
    // @ts-ignore - Prisma strict typing mapping
    setReservations(data);
    setIsLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus reservasi/status pending ini dari database?")) {
      await adminDeleteReservation(id);
      loadReservations();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Non-printable header */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
            Data & Cleanup Reservasi
          </h1>
          <p className="text-zinc-500 mt-1">
            Kelola, hapus transaksi PENDING untuk membersihkan DB, dan cetak laporan reservasi.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
            <Filter className="h-4 w-4 text-zinc-400 ml-2 mr-1" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-sm text-zinc-700 focus:outline-none py-1 pr-2 cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="daily">Hari Ini</option>
              <option value="monthly">Bulan Ini</option>
            </select>
          </div>
          <Button onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
            Cetak Laporan
          </Button>
        </div>
      </div>

      {/* Printable Report Section */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:p-0">
        <div className="hidden print:block mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-950 uppercase">CourtGrid Report</h2>
          <p className="text-zinc-500">Laporan Reservasi Lapangan - {filter.toUpperCase()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm print:text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-medium text-zinc-500 print:bg-transparent">
              <tr>
                <th className="px-6 py-3 print:px-2">ID & Tanggal</th>
                <th className="px-6 py-3 print:px-2">Pelanggan</th>
                <th className="px-6 py-3 print:px-2">Lapangan & Waktu</th>
                <th className="px-6 py-3 print:px-2">Nominal (Rp)</th>
                <th className="px-6 py-3 print:px-2">Status Pembayaran</th>
                <th className="px-6 py-3 print:hidden text-right">Aksi Cleanup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Memuat data...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Tidak ada data reservasi untuk filter ini.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50 transition-colors print:hover:bg-transparent">
                    <td className="px-6 py-4 print:px-2 text-zinc-700">
                      <div className="text-[10px] text-zinc-400 mb-1 font-mono">{res.id.slice(0,8)}...</div>
                      {format(new Date(res.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 print:px-2">
                      <div className="font-medium text-zinc-950">{res.user.name || "User"}</div>
                      <div className="text-xs text-zinc-500">{res.user.email}</div>
                    </td>
                    <td className="px-6 py-4 print:px-2 text-zinc-700">
                      <div className="font-medium text-zinc-950">{res.court.name}</div>
                      <div className="text-xs text-zinc-500">Jam: {res.startTime} - {res.endTime}</div>
                    </td>
                    <td className="px-6 py-4 print:px-2 font-medium text-zinc-950">
                      {res.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 print:px-2">
                      {res.status === "DP_PAID" || res.payment?.status === "VERIFIED" ? (
                        <div className="flex flex-col items-start">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 print:border print:border-emerald-300 print:bg-transparent">
                            DP PAID
                          </span>
                          <span className="text-[10px] text-emerald-600 mt-1 flex items-center print:hidden">
                            ✓ Verified by Stripe
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 print:border print:border-amber-300 print:bg-transparent">
                          {res.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 print:hidden text-right">
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="inline-flex items-center space-x-1 p-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                        title="Hapus / Cleanup DB"
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
      
      {/* Print-specific styles applied globally for clean PDF generation */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
