import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const company = [
    { title: "Tentang Kami", href: "/#about" },
    { title: "Katalog Arena", href: "/courts" },
    { title: "Pesan Online", href: "/dashboard/book" },
  ];

  const resources = [
    { title: "Syarat & Ketentuan", href: "/terms" },
    { title: "Kebijakan Privasi", href: "/privacy" },
    { title: "Bantuan FAQ", href: "/faq" },
  ];

  return (
    <footer className="w-full bg-white border-t border-zinc-200/80 mt-auto text-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group w-max outline-none">
              <Image src="/icon.ico" alt="CourtGrid Logo" width={32} height={32} className="rounded-lg object-contain transition-transform group-hover-fine:scale-95" />
              <span className="text-zinc-950 font-extrabold tracking-tight text-xl">
                CourtGrid
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-mono">
              Platform reservasi penyewaan arena futsal & badminton profesional. Bebas double booking dengan verifikasi DP otomatis 24/7.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 w-max">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                System Anti-Palkor Active
              </span>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Resources Column */}
            <div className="flex flex-col gap-3">
              <span className="text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider mb-1">
                Layanan & Legal
              </span>
              <div className="flex flex-col gap-2.5">
                {resources.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className="w-max text-sm font-mono text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company Column */}
            <div className="flex flex-col gap-3">
              <span className="text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider mb-1">
                Navigasi Publik
              </span>
              <div className="flex flex-col gap-2.5">
                {company.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className="w-max text-sm font-mono text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Contact Column */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
              <span className="text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider mb-1">
                Kontak GOR
              </span>
              <div className="flex flex-col gap-3 font-mono text-sm text-zinc-500">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                  <span>Blok M, Jakarta Selatan 12190</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0 text-zinc-400" />
                  <span>+62 877 4628 8262</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-zinc-400" />
                  <span>info@courtgrid.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200/80">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-mono text-zinc-500">
            <p>
              &copy; {year} CourtGrid. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Developed by</span>
              <span className="text-zinc-950 font-bold">Randi Maulana</span>
              <span>•</span>
              <span className="text-zinc-500">CourtGrid Standard</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
