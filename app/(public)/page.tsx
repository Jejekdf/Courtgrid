import Hero from "@/components/layout/Hero";
import Link from "next/link";
import { Zap, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col bg-white text-zinc-950">
      <main className="flex-1 w-full">
        {/* Hero Section Component */}
        <Hero />

        {/* Courts Section */}
        <section id="courts" className="bg-white py-24 relative z-10 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Pilihan Lapangan
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
                Fasilitas Premium untuk Performa Maksimal
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-zinc-500">
                Pilih dari berbagai lapangan Futsal dan Badminton bertaraf internasional yang kami sediakan.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-50 aspect-video flex flex-col justify-end p-6">
                <div className="absolute inset-0 bg-[url('/futsal1.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">Lapangan Futsal</h3>
                  <p className="text-zinc-200 text-sm">Rumput sintetis kualitas FIFA, pencahayaan LED standar kompetisi.</p>
                </div>
              </div>
              <div className="group relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-50 aspect-video flex flex-col justify-end p-6">
                <div className="absolute inset-0 bg-[url('/badminton1.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">Lapangan Badminton</h3>
                  <p className="text-zinc-200 text-sm">Karpet vinyl tebal anti-slip, cocok untuk turnamen maupun latihan santai.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-white border border-zinc-200 text-zinc-950 hover:bg-zinc-50 h-11 px-6 shadow-sm active:scale-[0.98]"
              >
                Lihat Ketersediaan Semua Lapangan
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Section - UI/UX Pro Max Flat Cards */}
        <section id="about" className="bg-zinc-50 border-t border-zinc-200 py-24 relative z-10 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Fitur Unggulan
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
                Pengalaman Booking Venue Tanpa Masalah
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-zinc-500">
                Dirancang khusus untuk atlet dan komunitas olahraga dengan presisi waktu tanpa risiko jadwal ganda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md space-y-5">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
                  Real-time Availability
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  Jadwal lapangan terupdate otomatis tanpa jeda. Bebas bentrokan jadwal booking antar pengguna.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md space-y-5">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
                  Presisi Slot Waktu
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  Sistem reservasi berbasis slot jam presisi yang fleksibel sesuai jadwal sesi latihan tim Anda.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md space-y-5">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-950">
                  Sistem Anti-Palkor
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  Pembayaran DP wajib mencegah pembatalan sepihak, memastikan komunitas yang serius dan suportif.
                </p>
              </div>
            </div>

            {/* Callout Banner */}
            <div className="mt-20 bg-zinc-950 rounded-2xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
              <div className="space-y-3 text-center md:text-left relative z-10">
                <h3 className="text-2xl font-bold text-white tracking-tight">Siap untuk Pertandingan Berikutnya?</h3>
                <p className="text-zinc-400 max-w-lg">Pilih lapangan favorit Anda dan amankan slot waktu dalam hitungan detik. Gabung dengan ratusan tim lainnya hari ini.</p>
              </div>
              <Link
                href="/schedule"
                className="relative z-10 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all bg-white text-zinc-950 hover:bg-zinc-100 h-12 px-8 shadow-sm shrink-0 active:scale-[0.98]"
              >
                Cek Jadwal Lapangan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
