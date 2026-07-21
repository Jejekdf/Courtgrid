import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun | CourtGrid",
  description: "Buat akun CourtGrid baru untuk reservasi dan kelola jadwal booking lapangan.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center space-x-2 mb-2 group">
            <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-mono font-bold text-sm tracking-tighter shadow-sm group-hover:bg-zinc-800 transition-colors">
              CG
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Buat Akun Baru
          </h1>
          <p className="text-xs text-zinc-500 font-normal">
            Lengkapi data diri Anda di bawah ini untuk bergabung dengan CourtGrid
          </p>
        </div>

        {/* Card Container — card-auth from DESIGN.MD */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-zinc-200 shadow-sm">
          <RegisterForm />
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 transition-colors"
          >
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
