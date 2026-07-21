import Hero from "@/components/layout/Hero";
import Link from "next/link";
import { Zap, Calendar, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans flex flex-col justify-between selection:bg-zinc-950 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-md bg-zinc-950 text-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter shadow-sm transition-transform group-hover:scale-[0.98]">
              CG
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-950 uppercase">
              CourtGrid
            </span>
          </Link>

          <nav className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md text-xs font-semibold transition-all bg-zinc-950 text-white hover:bg-zinc-800 h-9 px-4 shadow-sm active:scale-[0.98]"
            >
              Daftar Sekarang
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section Component */}
      <main className="flex-1">
        <Hero />

        {/* Feature Cards Section */}
        <section className="bg-zinc-50 border-t border-zinc-200 py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center mb-4 font-bold">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-950 tracking-tight">
                  Real-time Availability
                </h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Jadwal lapangan terupdate otomatis tanpa jeda. Bebas bentrokan jadwal booking antar pengguna.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center mb-4 font-bold">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-950 tracking-tight">
                  Presisi Slot Waktu
                </h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Sistem reservasi berbasis slot jam presisi yang fleksibel sesuai jadwal sesi latihan tim Anda.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center mb-4 font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-950 tracking-tight">
                  Konfirmasi Instan
                </h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Dapatkan bukti reservasi QR/Digital resmi secara instan begitu pembayaran diverifikasi.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded bg-zinc-950 text-white font-mono font-bold text-[10px] flex items-center justify-center">
              CG
            </div>
            <span className="font-semibold text-zinc-950">CourtGrid</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex space-x-6 text-xs text-zinc-500">
            <span className="hover:text-zinc-950 cursor-pointer transition-colors">Dokumentasi</span>
            <span className="hover:text-zinc-950 cursor-pointer transition-colors">Keamanan</span>
            <span className="hover:text-zinc-950 cursor-pointer transition-colors">Privasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
