import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/DashboardStats";
import RecentReservationsTable from "@/components/admin/RecentReservationsTable";

export default async function AdminDashboardPage() {
  // Fetch dynamic stats
  const [totalReservations, revenueResult, activeCourts] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: {
          in: ["DP_PAID", "DONE"],
        },
      },
    }),
    prisma.court.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  const totalRevenue = revenueResult._sum.totalPrice || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Pantau statistik harian dan aktivitas reservasi pelanggan terbaru Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStats 
        totalReservations={totalReservations}
        totalRevenue={totalRevenue}
        activeCourts={activeCourts}
      />

      {/* Data Table */}
      <RecentReservationsTable reservations={[]} />
    </div>
  );
}
