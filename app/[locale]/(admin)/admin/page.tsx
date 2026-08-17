"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import DashboardStats from "@/components/admin/DashboardStats";
import RecentReservationsTable from "@/components/admin/RecentReservationsTable";
import RevenueChart from "@/components/admin/RevenueChart";
import { adminKeys } from "@/lib/query-keys";
import { getAdminStatsAction } from "@/features/admin/actions";

type Stats = {
  totalReservations: number;
  totalRevenue: number;
  totalCourts: number;
  pendingCount: number;
  recentReservations: Array<{
    id: string;
    userName: string;
    userEmail: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
  }>;
  revenueChart: Array<{
    date: string;
    revenue: number;
  }>;
};

async function fetchAdminStats(router: ReturnType<typeof useRouter>): Promise<Stats> {
  const res = await getAdminStatsAction();
  if (!res.success) {
    if (res.unauthorized) {
      router.replace("/");
      throw new Error("Unauthorized");
    }
    throw new Error(res.error || "Gagal mengambil data statistik");
  }
  return res.data;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => fetchAdminStats(router),
    refetchInterval: 5000,
    staleTime: 4000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <AdminHeader
          title="Dashboard"
          description="Memuat statistik operasional..."
        />
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-100 rounded-xl" />
          <div className="h-64 bg-zinc-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <AdminHeader
          title="Dashboard"
          description="Gagal memuat statistik server."
          actions={
            <button onClick={() => refetch()} className="px-3 py-1.5 text-sm font-semibold bg-zinc-950 text-white rounded-lg">
              Coba Lagi
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-zinc-950">
      {/* Reusable Admin Header Component */}
      <AdminHeader
        title="Dashboard"
        description="Pantau statistik harian, pendapatan, dan aktivitas reservasi terbaru Anda."
      />

      <DashboardStats
        totalReservations={stats.totalReservations}
        totalRevenue={stats.totalRevenue}
        activeCourts={stats.totalCourts}
        pendingCount={stats.pendingCount}
      />

      <RevenueChart data={stats.revenueChart} />

      <RecentReservationsTable
        reservations={Array.isArray(stats?.recentReservations) ? stats.recentReservations.map((res) => {
          const isValidDate = res.date && !isNaN(new Date(res.date).getTime());
          return {
            id: res.id,
            customerName: res.userName || "Pelanggan",
            courtName: res.courtName || "Lapangan",
            date: isValidDate ? new Date(res.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
            time: res.startTime ? `${res.startTime} - ${res.endTime} WIB` : "-",
            status: (res.status || "PENDING") as "PENDING" | "DP_PAID" | "DONE" | "CANCELED",
            amount: `Rp ${(res.totalPrice || 0).toLocaleString("id-ID")}`,
          };
        }) : []}
      />
    </div>
  );
}
