import Hero from "@/components/layout/Hero";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col bg-white text-zinc-950 min-h-screen">
      <main className="flex-1 w-full">
        {/* Main Hero Component with Framer Motion */}
        <Hero />

        {/* Section 2: Lapangan & Fasilitas */}
        <section id="courts" className="relative py-24 scroll-mt-20 overflow-hidden bg-zinc-50/70 border-t border-zinc-200/80">
          <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Standard Fasilitas</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
                  Arena & Fasilitas Premium
                </h2>
                <p className="text-sm text-zinc-500 max-w-xl font-mono">
                  Pilihan spesifikasi lapangan futsal dan badminton berstandar nasional dengan perawatan berkala.
                </p>
              </div>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center text-xs font-bold font-mono text-zinc-950 hover:text-zinc-600 gap-1.5 group cursor-pointer min-h-11 py-2"
              >
                <span>Lihat Seluruh Katalog Lapangan</span>
                <ArrowRight className="w-4 h-4 transform group-hover-fine:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Futsal Card */}
              <div className="p-8 bg-white border border-zinc-200/80 rounded-3xl space-y-6 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    2 Lapangan Futsal
                  </span>
                  <span className="text-sm text-zinc-400 font-mono">Standar Nasional</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">Futsal Synthetic Turf</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                    Rumput sintetis monofilament tebal dengan bantalan peredam dampak cedera, penerangan sorot LED anti-glare, dan jaring pembatas perimeter penuh.
                  </p>
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono font-bold text-zinc-700 border-t border-zinc-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Rumput Monofilament</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> LED Stadium Lighting</span>
                </div>
              </div>

              {/* Badminton Card */}
              <div className="p-8 bg-white border border-zinc-200/80 rounded-3xl space-y-6 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    3 Lapangan Badminton
                  </span>
                  <span className="text-sm text-zinc-400 font-mono">Standar BWF</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">Badminton PVC Mat Anti-Slip</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                    Karpet vinyl PVC 5.0mm bersertifikat kompetisi dengan daya cengkeram tinggi anti-slip, didukung tiang net presisi dan pencahayaan khusus tidak silau.
                  </p>
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono font-bold text-zinc-700 border-t border-zinc-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> Mat Vinyl PVC 5mm</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> Pencahayaan Bebas Silau</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: About Us & Guarantees */}
        <section id="about" className="relative py-24 bg-white border-t border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Komitmen Layanan</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                  Solusi Manajemen Sewa Arena Bebas Bentrok
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  CourtGrid dirancang untuk mempermudah komunitas olahraga memesan lapangan secara transparan. Dengan integrasi pembayaran DP 50% otomatis, slot jam main langsung terkunci secara atomic di database tanpa risiko dipalkor.
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <p className="text-lg font-extrabold text-zinc-950 font-mono">100% Guaranteed</p>
                    </div>
                    <p className="text-sm text-zinc-500 font-mono">Bebas Palkor & Double Booking</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-zinc-950" />
                      <p className="text-lg font-extrabold text-zinc-950 font-mono">Instant Stripe</p>
                    </div>
                    <p className="text-sm text-zinc-500 font-mono">Verifikasi DP Otomatis 24/7</p>
                  </div>
                </div>
              </div>

              {/* Anti-Slop Visual Box */}
              <div className="bg-zinc-950 text-white rounded-3xl p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <div className="text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">CourtGrid Official Standard</h3>
                    <p className="text-sm text-zinc-300 font-mono">Sistem Reservasi Terverifikasi</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm font-mono text-zinc-100">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Atomic Lock Overlap:</span>
                    <span className="text-emerald-400 font-bold">AKTIF</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Auto-Cancel Timeout:</span>
                    <span className="text-white font-bold">15 Menit (Unpaid)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Metode Pembayaran DP:</span>
                    <span className="text-white font-bold">Stripe / QRIS</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Verifikasi Tiket:</span>
                    <span className="text-white font-bold">E-Ticket QR Code</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Callout Booking */}
        <section className="relative py-24 bg-white border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative overflow-hidden bg-zinc-950 rounded-3xl p-10 md:p-16 flex flex-col items-center text-center gap-8 shadow-xl">
              <div className="relative z-10 space-y-4 max-w-2xl">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Pemesanan Online</span>
                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Siap Amankan Slot Lapangan Anda?
                </h3>
                <p className="text-zinc-300 text-sm md:text-base font-mono">
                  Pilih tanggal dan jam main secara langsung melalui portal ketersediaan real-time CourtGrid.
                </p>
              </div>
              
              <Link
                href="/dashboard/book"
                className="relative z-10 inline-flex items-center justify-center rounded-xl text-xs font-bold font-mono bg-white text-zinc-950 hover:bg-zinc-100 h-12 px-8 shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                <span>Cek Ketersediaan Lapangan Realtime</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
