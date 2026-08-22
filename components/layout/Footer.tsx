"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { MapPin, Mail, Phone, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations("footer");

  const company = [
    { title: t("tentang"), href: "/about" },
    { title: t("katalog"), href: "/courts" },
    { title: t("pesanOnline"), href: "/dashboard/book" },
  ];

  const resources = [
    { title: t("syarat"), href: "/terms" },
    { title: t("privasi"), href: "/privacy" },
    { title: t("faq"), href: "/faq" },
  ];

  return (
    <footer className="w-full bg-white border-t border-zinc-200/80 mt-auto text-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group w-max outline-none">
              <Image
                src="/logo.svg"
                alt="CourtGrid Logo"
                width={32}
                height={32}
                className="rounded-lg object-contain transition-transform group-hover-fine:scale-95"
              />
              <span className="font-heading text-zinc-950 font-extrabold tracking-tight text-xl">
                CourtGrid
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 w-max">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                {t("antiPalkor")}
              </span>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Column 1: Kontak GOR */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-950 mb-1">
                {t("contactTitle")}
              </span>
              <address className="not-italic flex flex-col gap-3 text-sm text-zinc-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" aria-hidden="true" />
                  <span>{t("address")}</span>
                </div>
                <a
                  href="tel:+6287746288262"
                  className="flex items-center gap-2.5 hover:text-zinc-950 transition-colors w-max"
                  aria-label="Telepon CourtGrid"
                >
                  <Phone className="w-4 h-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <span>+62 877 4628 8262</span>
                </a>
                <a
                  href="mailto:info@courtgrid.com"
                  className="flex items-center gap-2.5 hover:text-zinc-950 transition-colors w-max"
                  aria-label="Email CourtGrid"
                >
                  <Mail className="w-4 h-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <span>info@courtgrid.com</span>
                </a>
              </address>
            </div>

            {/* Column 2: Navigasi Publik */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-950 mb-1">
                {t("navigationTitle")}
              </span>
              <nav aria-label={t("navigationTitle")} className="flex flex-col gap-2.5">
                {company.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className="w-max text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    {title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Layanan & Legal */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-950 mb-1">
                {t("servicesTitle")}
              </span>
              <nav aria-label={t("servicesTitle")} className="flex flex-col gap-2.5">
                {resources.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className="w-max text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    {title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200/80">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>
              &copy; {year} CourtGrid. {t("rights")}
            </p>
            <p className="flex items-center gap-1.5">
              <span>{t("developedBy")}</span>
              <span className="text-zinc-950 font-medium">Randi Maulana</span>
              <span>•</span>
              <span className="text-zinc-500">{t("standard")}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}