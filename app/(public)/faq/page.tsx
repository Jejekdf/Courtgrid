import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | CourtGrid",
  description: "Jawaban pertanyaan umum seputar reservasi, DP 50%, dan E-Ticket CourtGrid.",
};

const faqCategories = [
  {
    category: "Reservasi & Pembayaran DP 50%",
    items: [
      {
        q: "Bagaimana alur reservasi lapangan di CourtGrid?",
        a: "Pilih jenis arena (Futsal/Badminton), tentukan tanggal dan slot jam yang tersedia. Sistem akan mengarahkan Anda ke Stripe Checkout untuk pembayaran DP 50%. Setelah berhasil, E-Ticket berformat QR Code diterbitkan secara otomatis.",
      },
      {
        q: "Mengapa memberlakukan sistem DP 50%?",
        a: "Sistem DP (Down Payment) 50% diterapkan untuk mengunci jadwal lapangan secara otomatis di database dan mencegah pemesanan palsu (palkor) atau no-show yang merugikan pengguna lain.",
      },
      {
        q: "Berapa lama batas waktu penyelesaian pembayaran DP?",
        a: "Anda memiliki batas waktu 15 menit saat berada di halaman Stripe Checkout. Apabila pembayaran tidak diselesaikan dalam 15 menit, sistem otomatis melepaskan slot jam tersebut melalui fitur ghost-cancel.",
      },
      {
        q: "Apakah dana DP 50% dapat dikembalikan (refund)?",
        a: "DP 50% bersifat non-refundable apabila pembatalan dilakukan secara sepihak oleh pengguna. Pengembalian 100% hanya diproses jika terjadi pembatalan operasional darurat oleh pihak pengelola venue.",
      },
      {
        q: "Bagaimana cara melunasi sisa tagihan 50%?",
        a: "Sisa pembayaran 50% dilunasi langsung di kasir venue GOR sebelum jam pemakaian dimulai dengan menunjukkan QR Code E-Ticket yang tertera di menu Dashboard.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-white text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-10">
        {/* Page Header */}
        <header className="border-b border-zinc-200/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-mono font-bold text-zinc-600 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-950" />
            <span>Pusat Informasi FAQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Pertanyaan Umum (FAQ)
          </h1>
          <p className="text-sm text-zinc-500 font-mono leading-relaxed max-w-xl">
            Jawaban langsung untuk pertanyaan seputar alur pemesanan online, pembayaran DP 50%, dan verifikasi E-Ticket QR Code.
          </p>
        </header>

        {/* FAQ Accordion List */}
        <main className="space-y-8">
          {faqCategories.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                {cat.category}
              </span>
              <div className="border border-zinc-200/80 rounded-2xl p-2 bg-white shadow-xs">
                <Accordion className="w-full divide-y divide-zinc-100">
                  {cat.items.map((faq, i) => (
                    <AccordionItem key={i} value={`cat-${idx}-item-${i}`} className="border-b-0 px-3">
                      <AccordionTrigger className="text-left text-zinc-950 font-extrabold hover:text-zinc-700 text-sm py-4 cursor-pointer">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-600 leading-relaxed text-sm font-mono pb-4 pt-1">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </main>
      </PageWrapper>
    </div>
  );
}
