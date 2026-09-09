import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Zap, ShieldCheck, Building2, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import type { Locale } from "@/i18n/routing";

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
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
  setRequestLocale(locale);
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
    <div className="min-h-dvh pt-6 pb-16 px-4 sm:px-6 lg:px-8 bg-background text-zinc-950">
      <PageWrapper className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Modern Hero */}
          <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            <div className="lg:col-span-7 space-y-5">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.12] text-balance">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg xl:text-xl text-zinc-600 leading-relaxed max-w-2xl font-sans text-pretty">
                {t("description")}
              </p>
            </div>

            {/* Stats Dense Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-5 xl:gap-6">
              {stats.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 xl:p-6 bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col justify-between hover:border-zinc-400 transition-[border-color,box-shadow]"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block font-sans leading-snug">
                      {item.sub}
                    </span>
                    <p className={`font-heading text-lg sm:text-2xl xl:text-3xl font-extrabold tracking-tight tabular-nums ${item.color} mt-1.5 sm:mt-2`}>
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
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 pt-8 border-t border-zinc-200/80">
            <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
              <h2 className="font-heading text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("storyTitle")}
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5 text-base sm:text-lg xl:text-xl text-zinc-700 leading-relaxed font-sans text-pretty max-w-3xl">
              <p>{t("storyP1")}</p>
              <p>{t("storyP2")}</p>
              <p>{t("storyP3")}</p>
            </div>
          </section>

        {/* Lokasi GOR & Fasilitas */}
        <section className="bg-zinc-50 border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 text-zinc-950 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600 block font-sans">
              {t("mitraTitle")}
            </span>
            <p className="text-sm sm:text-base xl:text-lg leading-relaxed text-zinc-700 font-sans text-pretty">
              {t("mitraDesc")}
            </p>
          </div>
          <Link
            href="/courts"
            className="inline-flex items-center justify-center rounded-xl text-sm sm:text-base font-bold font-sans bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.98] min-h-12 h-12 sm:h-13 px-6 sm:px-8 shrink-0 transition-[background-color,transform] cursor-pointer gap-2 shadow-xs"
          >
            <span>{t("ctaButton")}</span>
            <ArrowUpRight className="size-4.5" aria-hidden="true" />
          </Link>
        </section>

        {/* Pillars Grid */}
        <section className="space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 block font-sans">
              {t("pillarsDesc")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-950 text-balance">
              {t("pillarsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 xl:p-10 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="size-12 xl:size-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-950 group-hover-fine:bg-zinc-950 group-hover-fine:text-white transition-colors">
                      <Icon className="size-6 xl:size-7" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl xl:text-2xl font-bold tracking-tight text-zinc-950">{p.title}</h3>
                    <p className="text-sm sm:text-base xl:text-lg text-zinc-600 leading-relaxed font-sans text-pretty">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Action CTA */}
        <section className="relative overflow-hidden bg-zinc-950 rounded-2xl sm:rounded-3xl p-10 sm:p-14 lg:p-20 text-center shadow-lg">
          <div className="space-y-5 max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {t("ctaTitle")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg xl:text-xl text-zinc-300 font-sans text-pretty">
              {t("ctaDesc")}
            </p>
            <div className="pt-2">
              <Link
                href="/courts"
                className="inline-flex items-center justify-center rounded-xl text-base xl:text-lg font-bold font-sans bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] min-h-12 sm:min-h-14 h-12 sm:h-14 px-8 sm:px-12 transition-[background-color,transform] cursor-pointer shadow-xs"
              >
                <span>{t("ctaButton")}</span>
                <ArrowUpRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        </div>
      </PageWrapper>
    </div>
  );
}
