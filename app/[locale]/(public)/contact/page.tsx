import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | CourtGrid",
  description: "Informasi kontak operasional dan formulir bantuan reservasi CourtGrid.",
};

const channelList = [
  {
    icon: MapPin,
    title: "Lokasi Arena Utama",
    desc: "SM Sport Center, Jl. Sisingamangaraja No. 12, Kebayoran Baru, Jakarta Selatan",
  },
  {
    icon: Phone,
    title: "Bantuan WhatsApp / Telepon",
    desc: "+62 877 4628 8262",
    mono: true,
  },
  {
    icon: Clock,
    title: "Jam Kerja Layanan",
    desc: "Senin – Jumat: 08.00 – 20.00 WIB | Sabtu – Minggu: 07.00 – 15.00 WIB",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-white text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-10">
        {/* Document Header */}
        <header className="border-b border-zinc-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span>Company</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold">Contact</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
            Hubungi Operasional
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
            Pertanyaan seputar reservasi jadwal, verifikasi transaksi DP, atau perizinan venue.
          </p>
        </header>

        {/* 2-Column Baseline Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Channels List */}
          <div className="md:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Saluran Informasi
            </span>
            <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
              {channelList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="py-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-950">
                      <Icon className="w-4 h-4 text-zinc-900 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className={`text-sm text-zinc-600 pl-6 leading-relaxed ${item.mono ? "font-mono font-semibold" : ""}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="md:col-span-7 space-y-4 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              <Mail className="w-4 h-4 text-zinc-900" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">Kirim Pesan</span>
            </div>
            <ContactForm />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
