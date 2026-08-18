import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/dal";
import { getCustomerReservationsDAL } from "@/features/reservations/dal";
import CustomerDashboardContent from "@/components/dashboard/CustomerDashboardContent";

export const metadata: Metadata = {
  title: "Dashboard Pelanggan | CourtGrid",
  description: "Area kerja dan dasbor pelanggan CourtGrid.",
};

export default async function CustomerDashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const reservationsRaw = await getCustomerReservationsDAL();

  const reservations = reservationsRaw.map((r) => ({
    id: r.id,
    court: r.courtName ? { name: r.courtName } : null,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
    totalPrice: r.totalPrice,
    status: r.status,
    user: { name: r.userName ?? null, email: r.userEmail ?? null },
    payment: r.dpAmount !== undefined || r.paymentStatus !== undefined ? { dpAmount: r.dpAmount, status: r.paymentStatus } : null,
  }));

  return <CustomerDashboardContent user={{ name: user.name, email: user.email }} reservations={reservations} />;
}
