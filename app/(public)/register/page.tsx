import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";
import { Metadata } from "next";
import { Quote, Hexagon } from "lucide-react";

export const metadata: Metadata = {
  title: "Daftar Akun | CourtGrid",
  description: "Buat akun CourtGrid baru untuk reservasi dan kelola jadwal booking lapangan.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex flex-row-reverse bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">


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
              Buat Akun Baru
            </h1>
            <p className="text-sm text-zinc-500 font-normal leading-relaxed">
              Bergabunglah dengan ratusan tim olahraga lainnya dan amankan lapangan favoritmu.
            </p>
          </div>

          {/* Form */}
          <div className="mt-8">
            <RegisterForm />
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-zinc-500 pt-4">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-zinc-950 underline underline-offset-4 hover:text-zinc-700 transition-colors"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* Left Panel: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 lg:p-24 border-r border-zinc-800">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('/badminton1.png')] bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-1000 hover:scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-l from-zinc-950 via-transparent to-transparent opacity-80" />
        
        {/* Decorative Blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full max-w-xl">
          <Quote className="text-emerald-500 w-12 h-12 mb-6 opacity-80" />
          <blockquote className="space-y-6">
            <p className="text-2xl lg:text-3xl font-medium leading-tight text-white">
              "Proses booking yang sangat transparan dan cepat. Sistem pembayaran DP membantu kami menghindari orang-orang yang sering cancel mendadak."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white font-bold text-lg">
                BW
              </div>
              <div>
                <div className="font-semibold text-white">Budi Wibowo</div>
                <div className="text-sm text-zinc-400">Pengelola Turnamen Lokal</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </main>
  );
}
