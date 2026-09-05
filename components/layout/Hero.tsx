import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ActiveCourtDTO } from "@/features/courts/dal";

export default async function Hero({ courts = [] }: { courts?: ActiveCourtDTO[] }) {
  const t = await getTranslations("hero");

  const courtImages = courts
    .filter((c): c is ActiveCourtDTO & { imageUrl: string } => Boolean(c.imageUrl))
    .slice(0, 4)
    .map((c, idx) => ({
      src: c.imageUrl,
      alt: `${c.name} (${c.type})`,
      name: c.name,
      type: c.type,
      priority: idx === 0,
    }));

  const images =
    courtImages.length > 0
      ? courtImages
      : [
          { src: "/futsal_arena_modern.webp", alt: "Futsal Court", name: "Futsal Arena", type: "FUTSAL", priority: true },
          { src: "/badminton_court_pro.webp", alt: "Badminton Court", name: "Badminton Court", type: "BADMINTON", priority: false },
          { src: "/futsal2.webp", alt: "Futsal Arena", name: "Futsal Court B", type: "FUTSAL", priority: false },
          { src: "/badminton2.webp", alt: "Badminton Pro Court", name: "Badminton Court 2", type: "BADMINTON", priority: false },
        ];

  return (
    <section className="relative w-full overflow-hidden bg-[var(--background)]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-8 sm:pb-12 flex flex-col items-center text-center">
        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 max-w-4xl leading-[1.12] mb-4 text-balance">
          {t("headline")}
        </h1>

        {/* Hero Subheadline */}
        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed mb-6 font-sans text-pretty">
          {t("subheadline")}
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/book" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm font-bold min-h-12 h-12 px-7 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] text-white rounded-xl shadow-sm transition-all duration-150 cursor-pointer group"
            >
              <span>{t("checkSchedule")}</span>
              <ArrowRight className="ml-2 size-4 transition-transform group-hover-fine:translate-x-1 text-white" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/courts" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-sm font-bold min-h-12 h-12 px-6 bg-white border border-zinc-200/90 text-zinc-900 hover:bg-zinc-50 active:scale-[0.98] rounded-xl transition-all duration-150 cursor-pointer shadow-2xs"
            >
              <span>Lihat Spesifikasi Lapangan</span>
            </Button>
          </Link>
        </div>

        {/* Visual Showcase - Responsive Swipeable Track on Mobile, Bento Grid on Desktop */}
        <div className="mt-8 sm:mt-10 w-full">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {images.map((img, idx) => (
              <Link
                key={idx}
                href="/dashboard/book"
                className="group relative rounded-2xl overflow-hidden border border-zinc-200/90 aspect-4/3 bg-zinc-100 shadow-xs hover:shadow-md hover:border-zinc-400 transition-all duration-200 block text-left shrink-0 w-[78vw] max-w-[320px] sm:w-auto sm:max-w-none snap-center"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={img.priority}
                  quality={85}
                  unoptimized={img.src.startsWith("http")}
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none will-change-transform"
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-0.5">
                    {img.type === "FUTSAL" ? "Rumput Sintetis" : "Karpet Vinyl BWF"}
                  </span>
                  <span className="text-base font-bold text-white tracking-tight leading-tight truncate drop-shadow-xs">
                    {img.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex sm:hidden items-center justify-center gap-1.5 text-xs text-zinc-400 mt-2 font-medium">
            <span>Geser untuk melihat 4 arena</span>
            <ArrowRight className="size-3" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
