import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil | CourtGrid",
  description: "Pembayaran DP booking lapangan Anda telah berhasil.",
};

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
            Pembayaran DP Berhasil!
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Terima kasih! Pembayaran DP untuk booking lapangan Anda telah kami terima.
            E-ticket telah dikirimkan ke email Anda.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/reservations">
            <Button className="w-full">Lihat Riwayat Booking</Button>
          </Link>
          <Link href="/dashboard/book">
            <Button variant="secondary" className="w-full">Booking Lagi</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
