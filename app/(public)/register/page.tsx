import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Quote, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Daftar Akun | CourtGrid",
  description: "Buat akun CourtGrid baru untuk reservasi dan kelola jadwal booking lapangan secara efisien.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex flex-row-reverse bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 xl:px-24 relative py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Header Branding */}
          <div className="flex flex-col space-y-3">
            <Link href="/" className="flex items-center gap-2.5 mb-2 group w-max outline-none">
              <Image src="/icon.ico" alt="CourtGrid Logo" width={32} height={32} priority className="rounded-lg object-contain transition-transform group-hover-fine:scale-95" />
              <span className="text-xl font-extrabold tracking-tight text-zinc-950">CourtGrid</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-zinc-500 font-mono leading-relaxed">
              Bergabunglah dengan ratusan tim olahraga lainnya dan amankan slot lapangan favorit Anda.
            </p>
          </div>

          {/* Register Form */}
          <div>
            <RegisterForm />
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm font-mono text-zinc-500 pt-2">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-zinc-950 underline underline-offset-4 hover:text-zinc-700 transition-colors"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* Left Panel: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 lg:p-20 border-r border-zinc-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('/badminton1.png')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-700 hover-fine:scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        
        {/* Anti-Slop Pill */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 w-max shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            100% Guaranteed Schedule
          </span>
        </div>

        {/* Testimonial Quote Content */}
        <div className="relative z-10 flex flex-col justify-end max-w-lg space-y-6">
          <Quote className="text-emerald-400 w-10 h-10 opacity-80" />
          <blockquote className="space-y-4">
            <p className="text-xl lg:text-2xl font-extrabold leading-tight text-white font-sans">
              &ldquo;Proses pendaftaran cepat dan sistem jadwalnya 100% akurat. Penanganan DP otomatis via Stripe membuat jadwal tim kami terjamin.&rdquo;
            </p>
            <footer className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-bold text-sm">
                BW
              </div>
              <div>
                <div className="font-extrabold text-white text-sm">Budi Wibowo</div>
                <div className="text-sm text-zinc-300 font-mono">Pengelola Turnamen Badminton</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </main>
  );
}
