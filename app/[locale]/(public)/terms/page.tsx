import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { ShieldCheck, Clock, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | CourtGrid",
  description: "Syarat dan ketentuan resmi penggunaan sistem reservasi serta fasilitas arena CourtGrid.",
};

const lastUpdated = "13 Agustus 2026";

const sections = [
  {
    id: "ketentuan-dp",
    title: "1. Ketentuan Uang Muka (DP 50%)",
    icon: ShieldCheck,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 leading-relaxed font-sans">
          Setiap transaksi pemesanan arena di CourtGrid diwajibkan melakukan pembayaran Down Payment (DP) sebesar <strong className="text-zinc-950 font-bold">50%</strong> dari total biaya sewa secara otomatis melalui gateway pembayaran Stripe Checkout.
        </p>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Pembatalan sepihak oleh pelanggan menyebabkan dana DP 50% hangus dan tidak dapat dikembalikan.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Pelunasan sisa 50% dilakukan di lokasi (GOR) secara tunai/QRIS sebelum sesi penggunaan arena dimulai.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Pengembalian dana 100% hanya diproses jika terjadi penutupan operasional darurat oleh pengelola venue.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "batas-waktu",
    title: "2. Batas Waktu Transaksi & Jadwal",
    icon: Clock,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 leading-relaxed font-sans">
          Sistem alokasi slot waktu CourtGrid memberlakukan batas waktu otomatis <strong className="text-zinc-950 font-bold">15 menit</strong> pada sesi transaksi pending.
        </p>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Jika pembayaran DP tidak diselesaikan dalam 15 menit, slot jam akan dirilis secara otomatis oleh sistem ghost-cancel.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Durasi penyewaan dihitung presisi sesuai jam yang tercantum pada E-Ticket QR tanpa kompensasi keterlambatan.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tata-tertib",
    title: "3. Tata Tertib Arena & Keselamatan",
    icon: AlertTriangle,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 leading-relaxed font-sans">
          Seluruh pengguna wajib mematuhi standar keselamatan dan fasilitas fisik di GOR CourtGrid Arena.
        </p>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Wajib menggunakan sepatu khusus olahraga (non-marking shoes) di arena indoor futsal & badminton.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Dilarang keras merokok, membawa senjata tajam, serta minuman beralkohol ke lingkungan arena.</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-white text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-10">
        {/* Document Header */}
        <header className="border-b border-zinc-200/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-mono font-bold text-zinc-600 shadow-xs">
            <FileText className="w-3.5 h-3.5 text-zinc-950" />
            <span>Dokumen Hukum Resmi</span>
            <span>•</span>
            <span>Diperbarui: {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-sm text-zinc-500 font-sans leading-relaxed max-w-2xl">
            Aturan dan ketentuan penggunaan sistem pemesanan online serta penggunaan arena olahraga CourtGrid.
          </p>
        </header>

        {/* Content Layout: Sticky Table of Contents & Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (Sidebar) */}
          <nav className="md:col-span-4 sticky top-28 space-y-3 p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Daftar Regulasi
            </span>
            <ul className="space-y-2 text-sm font-sans">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-zinc-600 hover:text-zinc-950 font-bold transition-colors hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Detailed Legal Sections */}
          <main className="md:col-span-8 space-y-8 divide-y divide-zinc-100">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <section id={s.id} key={s.id} className="pt-8 first:pt-0 space-y-4 scroll-mt-28">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-zinc-950">{s.title}</h2>
                  </div>
                  <div>
                    {s.content}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </PageWrapper>
    </div>
  );
}
