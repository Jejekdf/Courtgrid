import CourtBookingSystem from "@/components/CourtBookingSystem";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jadwal & Booking Lapangan | CourtGrid",
  description: "Cek jadwal ketersediaan lapangan presisi dan booking sekarang via DP Stripe.",
};

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans flex flex-col justify-between selection:bg-zinc-950 selection:text-white">


      {/* Main Schedule Workspace */}
      <main className="flex-1 pt-12 pb-24 px-6 bg-zinc-50/50">
        <div className="max-w-5xl mx-auto space-y-10">
          <CourtBookingSystem />
        </div>
      </main>


    </div>
  );
}
