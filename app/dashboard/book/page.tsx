import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CustomerBookingWorkspace from "@/components/dashboard/CustomerBookingWorkspace";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Pesan Lapangan | Customer Portal CourtGrid",
  description: "Booking lapangan futsal & badminton secara instan di Customer Portal.",
};

export default async function CustomerBookPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-zinc-950">
      {/* Shared Reusable PageHeader (Consistent with Admin) */}
      <PageHeader
        title="Pesan Lapangan & Sesi Sewa"
        description="Pilih arena favorit Anda, tentukan tanggal main, dan reservasi jam sesi yang tersedia secara realtime."
      />

      <CustomerBookingWorkspace />
    </div>
  );
}
