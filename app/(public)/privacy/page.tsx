import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Database, Eye, Lock, Shield, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | CourtGrid",
  description: "Ketentuan pengelolaan dan perlindungan data pribadi pengguna platform CourtGrid.",
};

const lastUpdated = "13 Agustus 2026";

const sections = [
  {
    id: "pengumpulan-data",
    title: "1. Pengumpulan & Pengolahan Data",
    icon: Database,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 leading-relaxed font-sans">
          Kami mengumpulkan informasi pribadi secara terbatas dan transparan untuk mendukung kebutuhan autentikasi serta reservasi arena olahraga di CourtGrid.
        </p>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong className="text-zinc-950">Data Akun:</strong> Nama, alamat email, dan avatar profil yang diotorisasi via Google, Facebook, atau registrasi langsung.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong className="text-zinc-950">Data Transaksi:</strong> Informasi DP 50% diproses terenkripsi via Stripe Checkout. Server kami tidak pernah menyimpan nomor kartu kredit.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong className="text-zinc-950">E-Ticket QR:</strong> Nomor rujukan unik digunakan khusus untuk verifikasi check-in kasir di GOR.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "penggunaan-data",
    title: "2. Penggunaan Data Pengguna",
    icon: Eye,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 leading-relaxed font-sans">
          Seluruh data yang dikumpulkan digunakan secara eksklusif untuk kelancaran operasional platform CourtGrid:
        </p>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Memverifikasi identitas akun dan ketersediaan jadwal slot arena secara otomatis.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Memvalidasi E-Ticket QR Code saat penukaran di kasir arena olahraga.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Mengirimkan resi pembayaran DP dan bukti booking resmi melalui email.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "keamanan-data",
    title: "3. Keamanan & Perlindungan Privasi",
    icon: Lock,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 leading-relaxed font-sans">
          Kami menerapkan proteksi teknis berstandar industri untuk menjamin kerahasiaan data pribadi pengguna.
        </p>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Transmisi data dienkripsi dengan protokol HTTPS / SSL/TLS berkecepatan tinggi.</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Kami tidak pernah menjual, memperjualbelikan, atau memberikan data pribadi ke pihak komersial mana pun.</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-white text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-10">
        {/* Document Header */}
        <header className="border-b border-zinc-200/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-mono font-bold text-zinc-600 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-zinc-950" />
            <span>Dokumen Privasi Resmi</span>
            <span>•</span>
            <span>Diperbarui: {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Kebijakan Privasi Data
          </h1>
          <p className="text-sm text-zinc-500 font-sans leading-relaxed max-w-2xl">
            Penjelasan transparan mengenai bagaimana data pribadi Anda dikumpulkan, digunakan, dan dilindungi oleh platform CourtGrid.
          </p>
        </header>

        {/* Content Layout: Sticky Table of Contents & Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (Sidebar) */}
          <nav className="md:col-span-4 sticky top-28 space-y-3 p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Daftar Privasi
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

          {/* Detailed Content Sections */}
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
