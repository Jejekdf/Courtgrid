import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowRight, CalendarDays, Zap, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Hero() {
  const t = await getTranslations("hero");

  const images = [
    { src: "/futsal1.webp", alt: "Futsal Court", priority: true },
    { src: "/badminton1.webp", alt: "Badminton Court" },
    { src: "/futsal2.webp", alt: "Futsal Arena" },
    { src: "/badminton2.webp", alt: "Badminton Pro Court" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[var(--background)]">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-40 z-0" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[88rem] mx-auto px-6 pt-10 pb-20 md:pt-14 md:pb-28 flex flex-col items-center text-center">
        
        {/* Anti-Slop Clean Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 mb-8 shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950">
            {t("badge")}
          </span>
        </div>

        {/* Hero Headline — fluid with clamp, 320→1920 (tailwind ^4 arbitrer, rem locked) */}
        <h1 className="text-[clamp(1.875rem,5vw,3.75rem)] font-bold tracking-tight text-zinc-950 max-w-5xl leading-[1.05] mb-6">
          {t("headline")}
        </h1>

        {/* Hero Subheadline */}
        <p className="text-base md:text-lg text-zinc-600 max-w-2xl leading-relaxed mb-10 font-sans">
          {t("subheadline")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/dashboard/book" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-sm font-bold min-h-11 h-12 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-xs cursor-pointer group">
              <span>{t("checkSchedule")}</span>
              <ArrowRight className="ml-2 size-4 transition-transform group-hover-fine:translate-x-1 text-white" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm font-bold min-h-11 h-12 px-6 bg-[var(--background)] border border-zinc-200 text-zinc-950 hover:bg-zinc-100 rounded-xl cursor-pointer">
              {t("registerAccount")}
            </Button>
          </Link>
        </div>

        {/* Trust Indicators / Quick Stats */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 pt-8 border-t border-zinc-200/80 w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center gap-1.5">
            <Zap className="size-5 text-emerald-600 mb-1" aria-hidden="true" />
            <span className="text-xl font-extrabold text-zinc-950 font-mono">{t("statRealtime")}</span>
            <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">{t("statRealtimeDesc")}</span>
          </div>

          <div className="flex flex-col items-center text-center gap-1.5">
            <ShieldCheck className="size-5 text-emerald-600 mb-1" aria-hidden="true" />
            <span className="text-xl font-extrabold text-zinc-950 font-mono">{t("statGuarantee")}</span>
            <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">{t("statGuaranteeDesc")}</span>
          </div>

          <div className="flex flex-col items-center text-center gap-1.5 col-span-2 md:col-span-1">
            <CalendarDays className="size-5 text-zinc-950 mb-1" aria-hidden="true" />
            <span className="text-xl font-extrabold text-zinc-950 font-mono">{t("statCourts")}</span>
            <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">{t("statCourtsDesc")}</span>
          </div>
        </div>

        {/* Visual Showcase - Courts */}
        <div className="mt-16 w-full max-w-7xl 2xl:max-w-[88rem] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-2xl overflow-hidden shadow-xs border border-zinc-200/80 aspect-video md:aspect-4/5 bg-zinc-100 ${idx % 2 !== 0 ? 'md:translate-y-6' : ''}`}
            >
              <Image 
                src={img.src} 
                alt={img.alt}
                fill
                priority={img.priority}
                className="object-cover transition-transform duration-500 hover-fine:scale-105" 
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-zinc-950/50 via-transparent to-transparent opacity-0 hover-fine:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{t("courtShowcaseAlt")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
