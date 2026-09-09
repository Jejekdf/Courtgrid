"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface ShowcaseImage {
  id?: string;
  src: string;
  alt: string;
  name: string;
  type: string;
  surfaceLabel: string;
  priority: boolean;
}

interface HeroShowcaseTrackProps {
  images: ShowcaseImage[];
  swipeHint: string;
}

export function HeroShowcaseTrack({ images, swipeHint }: HeroShowcaseTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const step = 310;
    const offset = direction === "left" ? -step : step;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="mt-8 sm:mt-10 w-full relative group/carousel">
      {/* Header Controls for Desktop Slider */}
      <div className="hidden sm:flex items-center justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous court"
          className="size-10 xl:size-11 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-zinc-800 transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Next court"
          className="size-10 xl:size-11 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-zinc-800 transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-3.5 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {images.map((img, idx) => (
          <Link
            key={idx}
            href={img.id ? `/dashboard/book?courtId=${img.id}` : "/dashboard/book"}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/90 aspect-16/10 bg-zinc-100 shadow-xs hover:shadow-md hover:border-zinc-400 transition-[border-color,box-shadow] duration-200 block text-left shrink-0 w-[82vw] max-w-[320px] sm:w-80 md:w-88 lg:w-96 xl:w-[420px] snap-start"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={img.priority}
              quality={85}
              unoptimized={img.src.startsWith("http")}
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 352px, (max-width: 1280px) 384px, 420px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/90 via-zinc-950/30 to-transparent flex flex-col justify-end p-4 sm:p-5 lg:p-6">
              <span className="text-xs sm:text-sm uppercase font-bold tracking-wider text-emerald-400 mb-1 whitespace-nowrap font-sans">
                {img.surfaceLabel}
              </span>
              <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-extrabold text-white tracking-tight leading-tight truncate drop-shadow-xs">
                {img.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 text-xs text-zinc-400 mt-2 font-medium">
        <span>{swipeHint}</span>
        <ArrowRight className="size-3" aria-hidden="true" />
      </div>
    </div>
  );
}

export default HeroShowcaseTrack;
