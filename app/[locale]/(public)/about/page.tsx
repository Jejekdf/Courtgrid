import { Metadata } from "next";
import Image from "next/image";
import PageWrapper from "@/components/ui/PageWrapper";
import { Zap, ShieldCheck, Building2, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";

const BASE_URL = SITE_URL;

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("about");
  const title = `${t("metaTitle")} | CourtGrid`;
  const description = t("metaDesc");
  const url = `${BASE_URL}/${locale}/about`;

  return {
    title: t("metaTitle"),
    description,
    alternates: {
      canonical: url,
      languages: {
        id: `${BASE_URL}/id/about`,
        en: `${BASE_URL}/en/about`,
        "x-default": `${BASE_URL}/about`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CourtGrid",
      locale: locale === "id" ? "id_ID" : "en_US",
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}


export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");
  const th = await getTranslations("header");

  const breadcrumbItems = [
    { label: th("navBeranda"), href: "/" },
    { label: t("breadcrumbAbout") },
  ];

  const stats = [
    { label: t("stats.arenasLabel"), value: t("stats.arenas"), sub: t("stats.arenasSub"), color: "text-emerald-600" },
    { label: t("stats.dpLabel"), value: t("stats.dp"), sub: t("stats.dpSub"), color: "text-sky-600" },
    { label: t("stats.timeLabel"), value: t("stats.time"), sub: t("stats.timeSub"), color: "text-zinc-950" },
    { label: t("stats.securityLabel"), value: t("stats.security"), sub: t("stats.securitySub"), color: "text-emerald-600" },
  ];

  const pillars = [
    {
      icon: Zap,
      title: t("pillar1Title"),
      desc: t("pillar1Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("pillar2Title"),
      desc: t("pillar2Desc"),
    },
    {
      icon: Building2,
      title: t("pillar3Title"),
      desc: t("pillar3Desc"),
    },
  ];

  return (
    <div className="min-h-dvh pt-4 sm:pt-6 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-background text-zinc-950">
      <PageWrapper className="max-w-6xl xl:max-w-300 2xl:max-w-340 mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Modern Hero */}
          <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight text-balance">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl xl:max-w-2xl font-sans text-pretty">
                {t("description")}
              </p>
            </div>

            {/* Stats Dense Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 xl:gap-5">
              {stats.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 xl:p-6 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-[border-color,box-shadow]"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block font-sans leading-snug">
                      {item.sub}
                    </span>
                    <p className={`font-heading text-lg sm:text-2xl xl:text-3xl font-extrabold tracking-tight tabular-nums whitespace-nowrap ${item.color} mt-1.5 sm:mt-2`}>
                      {item.value}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 font-medium font-sans border-t border-zinc-100/80 pt-2.5 sm:pt-3 mt-2.5 sm:mt-3">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </header>

          {/* Company Story */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 pt-8 border-t border-zinc-200/80 items-start">
            {/* Left Column: Story Header + Context Visual */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 text-balance">
                  {t("storyTitle")}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("storySubtitle")}
                </p>
              </div>

              {/* Arena Showcase */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-zinc-200/90 shadow-2xs bg-zinc-100">
                <Image
                  src="/futsal_arena_modern.webp"
                  alt="CourtGrid Arena"
                  fill
                  sizes="(min-width: 1024px) 35vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column: Unified Editorial Narrative */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 divide-y divide-zinc-100 shadow-2xs space-y-6">
              <div className="space-y-2 pb-6 first:pt-0">
                <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950">
                  {t("storyStage1")}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("storyP1")}
                </p>
              </div>

              <div className="space-y-2 pt-6">
                <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950">
                  {t("storyStage2")}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("storyP2")}
                </p>
              </div>

              <div className="space-y-2 pt-6">
                <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950">
                  {t("storyStage3")}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("storyP3")}
                </p>
              </div>
            </div>
          </section>

        {/* Lokasi GOR & Fasilitas */}
        <section className="bg-zinc-50 border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-zinc-950 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 shadow-xs">
          <div className="space-y-2 max-w-2xl xl:max-w-3xl">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-zinc-950">
              {t("mitraTitle")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-sans text-pretty">
              {t("mitraDesc")}
            </p>
          </div>
          <Link
            href="/courts"
            className="inline-flex items-center justify-center rounded-xl text-sm sm:text-base font-bold font-sans bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.98] min-h-11 sm:min-h-12 h-11 sm:h-12 px-6 sm:px-7 shrink-0 transition-[background-color,transform] cursor-pointer gap-2 shadow-xs"
          >
            <span>{t("ctaButton")}</span>
            <ArrowUpRight className="size-4.5" aria-hidden="true" />
          </Link>
        </section>

        {/* Facility & Service Standards */}
        <section className="space-y-6 sm:space-y-8">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-950 text-balance">
              {t("pillarsTitle")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
              {t("pillarsDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 xl:gap-8">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 xl:p-8 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl space-y-3.5 shadow-xs hover:border-zinc-300 transition-[border-color,box-shadow] group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <div className="size-10 sm:size-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 group-hover-fine:bg-zinc-950 group-hover-fine:text-white transition-colors shrink-0">
                        <Icon className="size-5 sm:size-5.5" aria-hidden="true" />
                      </div>
                      <h3 className="font-heading text-base sm:text-lg xl:text-xl font-bold text-zinc-950 leading-snug text-balance">
                        {p.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Action CTA */}
        <section className="relative overflow-hidden bg-zinc-950 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-md">
          <div className="space-y-4 max-w-2xl xl:max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {t("ctaTitle")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 font-sans text-pretty">
              {t("ctaDesc")}
            </p>
            <div className="pt-2">
              <Link
                href="/courts"
                className="inline-flex items-center justify-center rounded-xl text-sm sm:text-base font-bold font-sans bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] min-h-11 sm:min-h-12 h-11 sm:h-12 px-7 sm:px-8 transition-[background-color,transform] cursor-pointer shadow-xs"
              >
                <span>{t("ctaButton")}</span>
                <ArrowUpRight className="ml-2 h-4.5 w-4.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        </div>
      </PageWrapper>
    </div>
  );
}
