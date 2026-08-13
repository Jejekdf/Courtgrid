import { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pembayaran Dibatalkan | CourtGrid",
  description: "Pembayaran DP booking lapangan Anda dibatalkan.",
};

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
            Pembayaran Dibatalkan
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Anda membatalkan pembayaran DP. Bookingan belum dikonfirmasi.
            Jika masih ingin melanjutkan, silakan lakukan pembayaran sebelum slot berakhir.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/book">
            <Button className="w-full">Kembali ke Booking</Button>
          </Link>
          <Link href="/dashboard/reservations">
            <Button variant="secondary" className="w-full">Lihat Riwayat Booking</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
