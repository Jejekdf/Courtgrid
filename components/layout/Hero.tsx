import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ActiveCourtDTO } from "@/features/courts/dal";
import { HeroShowcaseTrack, type ShowcaseImage } from "./HeroShowcaseTrack";

export default async function Hero({ courts = [] }: { courts?: ActiveCourtDTO[] }) {
  const t = await getTranslations("hero");

  const courtImages: ShowcaseImage[] = courts
    .filter((c): c is ActiveCourtDTO & { imageUrl: string } => Boolean(c.imageUrl))
    .map((c, idx) => ({
      id: c.id,
      src: c.imageUrl,
      alt: `${c.name} (${c.type})`,
      name: c.name,
      type: c.type,
      surfaceLabel: c.type === "FUTSAL" ? t("turfSurface") : t("vinylSurface"),
      priority: idx === 0,
    }));

  const images: ShowcaseImage[] =
    courtImages.length > 0
      ? courtImages
      : [
          { src: "/futsal_arena_modern.webp", alt: "Futsal Court A", name: "Futsal Court A", type: "FUTSAL", surfaceLabel: t("turfSurface"), priority: true },
          { src: "/futsal2.webp", alt: "Futsal Court B", name: "Futsal Court B", type: "FUTSAL", surfaceLabel: t("turfSurface"), priority: false },
          { src: "/badminton_court_pro.webp", alt: "Badminton Court 1", name: "Badminton Court 1", type: "BADMINTON", surfaceLabel: t("vinylSurface"), priority: false },
          { src: "/badminton2.webp", alt: "Badminton Court 2", name: "Badminton Court 2", type: "BADMINTON", surfaceLabel: t("vinylSurface"), priority: false },
          { src: "/badminton3.webp", alt: "Badminton Court 3", name: "Badminton Court 3", type: "BADMINTON", surfaceLabel: t("vinylSurface"), priority: false },
        ];

  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-20 flex flex-col items-center text-center">
        {/* Hero Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 max-w-4xl leading-[1.15] sm:leading-[1.12] mb-4 text-balance">
          {t("headline")}
        </h1>

        {/* Hero Subheadline */}
        <p className="text-base sm:text-lg lg:text-xl text-zinc-600 max-w-3xl leading-relaxed mb-6 sm:mb-8 font-sans text-pretty">
          {t("subheadline")}
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link href="/dashboard/book" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base font-bold min-h-12 sm:min-h-13 h-12 sm:h-13 px-7 sm:px-8 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] text-white rounded-xl shadow-sm transition-[background-color,transform] duration-150 cursor-pointer group"
            >
              <span>{t("checkSchedule")}</span>
              <ArrowRight className="ml-2 size-4 sm:size-5 transition-transform group-hover-fine:translate-x-1 text-white" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/courts" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base font-bold min-h-12 sm:min-h-13 h-12 sm:h-13 px-6 sm:px-8 bg-white border border-zinc-200/90 text-zinc-900 hover:bg-zinc-50 active:scale-[0.98] rounded-xl transition-[background-color,transform] duration-150 cursor-pointer shadow-2xs"
            >
              <span>{t("viewSpecs")}</span>
            </Button>
          </Link>
        </div>

        {/* Visual Showcase - Smooth Responsive Carousel Track */}
        <HeroShowcaseTrack images={images} swipeHint={t("swipeHint")} />
      </div>
    </section>
  );
}
