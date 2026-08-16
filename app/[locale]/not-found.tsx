import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-emerald-600">404</p>
      <h1 className="text-xl font-semibold text-zinc-950">Halaman tidak ditemukan</h1>
      <p className="text-sm text-zinc-500">
        Halaman yang Anda cari sudah dipindah atau tidak tersedia.
      </p>
      <Link href="/">
        <Button>Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}