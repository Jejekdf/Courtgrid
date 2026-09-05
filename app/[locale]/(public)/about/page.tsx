import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Zap, ShieldCheck, Building2, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "about" });
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
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "about" });
  const th = await getTranslations({ locale: locale as "id" | "en", namespace: "header" });

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
      <PageWrapper className="max-w-5xl mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        <div className="space-y-10 sm:space-y-12">
          {/* Modern Hero */}
          <header className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">

          <div className="md:col-span-7 space-y-4">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.1]">
              {t("title")}
            </h1>
            <p className="text-base text-zinc-700 leading-relaxed max-w-xl font-sans text-pretty">
              {t("description")}
            </p>
          </div>

          {/* Stats Dense Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3.5 sm:gap-4">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between hover:border-zinc-400 transition-[border-color,box-shadow]"
              >
                <div>
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 block font-sans min-h-10 sm:min-h-0 leading-tight">
                    {item.sub}
                  </span>
                  <p className={`font-heading text-lg sm:text-2xl font-extrabold tracking-tight tabular-nums whitespace-nowrap ${item.color} mt-1 sm:mt-1.5`}>
                    {item.value}
                  </p>
                </div>
                <p className="text-xs text-zinc-600 font-medium font-sans border-t border-zinc-100/80 pt-2 mt-2">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </header>

        {/* Company Story */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 pt-4 border-t border-zinc-200/80">
          <div className="md:col-span-5">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-950">
              {t("storyTitle")}
            </h2>
          </div>
          <div className="md:col-span-7 space-y-3.5 text-base text-zinc-700 leading-relaxed font-sans text-pretty">
            <p>{t("storyP1")}</p>
            <p>{t("storyP2")}</p>
            <p>{t("storyP3")}</p>
          </div>
        </section>

        {/* Lokasi GOR & Fasilitas */}
        <section className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-6 sm:p-8 text-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block font-sans">
              {t("mitraTitle")}
            </span>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-700 font-sans text-pretty">
              {t("mitraDesc")}
            </p>
          </div>
          <Link
            href="/courts"
            className="inline-flex items-center justify-center rounded-xl text-sm font-bold font-sans bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.98] min-h-11 h-12 px-6 shrink-0 transition-all cursor-pointer gap-1.5 shadow-xs"
          >
            <span>{t("ctaButton")}</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        {/* Pillars Grid */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block font-sans">
              {t("pillarsDesc")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 text-balance">
              {t("pillarsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 bg-background border border-zinc-200/80 rounded-2xl space-y-3 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group"
                >
                  <div className="p-2.5 w-max bg-zinc-100 rounded-xl text-zinc-950 group-hover-fine:bg-zinc-950 group-hover-fine:text-white transition-colors">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-bold tracking-tight text-zinc-950">{p.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed font-sans text-pretty">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Action CTA */}
        <section className="relative overflow-hidden bg-zinc-950 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-lg">
          <div className="space-y-3.5 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {t("ctaTitle")}
            </h3>
            <p className="text-sm md:text-base text-zinc-300 font-sans text-pretty">
              {t("ctaDesc")}
            </p>
            <Link
              href="/courts"
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold font-sans bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] min-h-11 h-12 px-8 transition-all cursor-pointer shadow-xs"
            >
              <span>{t("ctaButton")}</span>
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
        </div>
      </PageWrapper>
    </div>
  );
}
