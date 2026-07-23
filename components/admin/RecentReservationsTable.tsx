import { CalendarX } from "lucide-react";

interface Reservation {
  id: string;
  customerName: string;
  courtName: string;
  date: string;
  time: string;
  status: "PENDING" | "DP_PAID" | "DONE" | "CANCELED";
  amount: string;
}

export default function RecentReservationsTable({ reservations = [] }: { reservations?: Reservation[] }) {
  const getStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "DP_PAID":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md">DP Paid</span>;
      case "PENDING":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Pending</span>;
      case "DONE":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-md">Lunas</span>;
      case "CANCELED":
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 rounded-md">Canceled</span>;
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
        <h3 className="text-lg font-medium tracking-tight text-zinc-950">Reservasi Terbaru</h3>
        <button className="text-sm font-medium text-zinc-950 hover:text-zinc-700 transition-colors">
          Lihat Semua &rarr;
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <CalendarX className="w-6 h-6 text-zinc-400" />
          </div>
          <h4 className="text-base font-semibold text-zinc-950 mb-1">Tidak Ada Data</h4>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Belum ada data reservasi pelanggan saat ini. Pesanan baru akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 font-semibold border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Lapangan</th>
                <th className="px-6 py-4">Jadwal</th>
                <th className="px-6 py-4">Total Harga</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{res.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-950">{res.customerName}</td>
                  <td className="px-6 py-4 text-zinc-700">{res.courtName}</td>
                  <td className="px-6 py-4 text-zinc-700">
                    <div className="flex flex-col">
                      <span>{res.date}</span>
                      <span className="text-xs text-zinc-500">{res.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-950">{res.amount}</td>
                  <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
