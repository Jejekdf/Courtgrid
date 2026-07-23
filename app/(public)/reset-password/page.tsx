import Link from "next/link";
import { Metadata } from "next";
import { Quote, Hexagon } from "lucide-react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | CourtGrid",
  description: "Atur ulang kata sandi CourtGrid Anda.",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full flex flex-row-reverse bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <Link 
          href="/login" 
          className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-2"
        >
          &larr; Kembali ke Login
        </Link>

        <div className="w-full max-w-sm mx-auto space-y-8 mt-12 mb-12">
          {/* Header Branding */}
          <div className="flex flex-col space-y-3">
            <Link href="/" className="flex items-center space-x-3 mb-2 group w-max outline-none [-webkit-tap-highlight-color:transparent]">
              <div className="h-11 w-11 relative flex items-center justify-center transition-transform group-hover:scale-[0.98]">
                <Hexagon className="absolute inset-0 w-full h-full text-zinc-950 fill-zinc-950/5 stroke-[1.5]" />
                <img src="/favicon.ico" alt="Logo" className="absolute w-5 h-5 object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-950">CourtGrid</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              Buat Password Baru
            </h1>
            <p className="text-sm text-zinc-500 font-normal leading-relaxed">
              Silakan masukkan password baru Anda. Pastikan kombinasi karakter cukup kuat demi keamanan.
            </p>
          </div>

          {/* Form */}
          <div className="mt-8">
            <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-zinc-500">Memuat form...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Left Panel: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 lg:p-24 border-r border-zinc-800">
        <div className="absolute inset-0 bg-[url('/badminton1.png')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-1000 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-end h-full max-w-xl">
          <Quote className="text-emerald-500 w-12 h-12 mb-6 opacity-80" />
          <blockquote className="space-y-6">
            <p className="text-2xl lg:text-3xl font-medium leading-tight text-white">
              "Kenyamanan bertransaksi dan keamanan data pelanggan selalu menjadi prioritas nomor satu kami."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white font-bold text-lg">
                CG
              </div>
              <div>
                <div className="font-semibold text-white">Security Team CourtGrid</div>
                <div className="text-sm text-zinc-400">Proteksi Aktif 24/7</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </main>
  );
}
