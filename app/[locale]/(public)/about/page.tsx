import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Zap, ShieldCheck, Building2, ChevronRight, ArrowUpRight, Award, Target, Users2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | CourtGrid",
  description: "Mengenal CourtGrid — Platform reservasi dan ekosistem venue olahraga modern di Indonesia.",
};

const stats = [
  { label: "Arena Terintegrasi", value: "5 Arena Utama", sub: "Futsal & Badminton" },
  { label: "Garansi Jadwal", value: "DP 50%", sub: "Sistem Anti-Palkor" },
  { label: "Waktu Konfirmasi", value: "< 1 Detik", sub: "Pesan Instan Real-time" },
  { label: "Keamanan Server", value: "SSL / TLS", sub: "Enkripsi Transaksi" },
];

const pillars = [
  {
    icon: Zap,
    title: "1. Pemesanan Instan 24/7",
    desc: "Menghilangkan proses konfirmasi manual yang memakan waktu. Jadwal arena yang ditampilkan di layar selalu akurat secara real-time.",
  },
  {
    icon: ShieldCheck,
    title: "2. Kepastian Sistem DP 50%",
    desc: "Melindungi kepentingan pemain dan pengelola arena dari risiko pembatalan sepihak (palkor) atau slot yang terbengkalai.",
  },
  {
    icon: Building2,
    title: "3. Fasilitas Berstandar Resmi",
    desc: "Bekerja sama secara eksklusif dengan SM Sport Center untuk menyediakan lapangan futsal rumput sintetis dan badminton mat vinyl berkualitas tinggi.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-white text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-12">
        {/* Header Document */}
        <header className="border-b border-zinc-200 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span>Company</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold">About Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-tight">
            Menetapkan Standar Baru Pengelolaan Arena Olahraga.
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
            CourtGrid dibangun untuk memberikan pengalaman reservasi yang efisien, jujur, dan dapat diandalkan bagi komunitas olahraga di Indonesia.
          </p>
        </header>

        {/* Operational Metrics (Dense Baseline-UI Grid) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1"
            >
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {item.sub}
              </span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">{item.value}</p>
              <p className="text-sm text-zinc-500 font-medium">{item.label}</p>
            </div>
          ))}
        </section>

        {/* Pillars of Service (Simple List with Divider, No AI Slop Cards) */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950">
              Pilar Utama Platform
            </h2>
            <p className="text-sm text-zinc-500">
              Prinsip desain dan keandalan sistem yang kami terapkan pada setiap transaksi.
            </p>
          </div>

          <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="py-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="p-2 w-max bg-zinc-100 rounded-lg text-zinc-950 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-950">{p.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Action Link */}
        <section className="bg-zinc-950 rounded-xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold">Ingin Mengamankan Waktu Bertanding?</h3>
            <p className="text-sm text-zinc-400">
              Cek ketersediaan slot lapangan Futsal & Badminton SM Sport Center hari ini.
            </p>
          </div>
          <Link
            href="/courts"
            className="px-4 py-2 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Lihat Katalog Arena</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </PageWrapper>
    </div>
  );
}
