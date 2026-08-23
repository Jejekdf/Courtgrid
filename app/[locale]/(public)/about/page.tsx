import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Zap, ShieldCheck, Building2, ArrowUpRight, Award } from "lucide-react";
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
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: {
        id: `${BASE_URL}/id/about`,
        en: `${BASE_URL}/en/about`,
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      url: `${BASE_URL}/${locale}/about`,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
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
    { label: t("metaTitle") },
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
    <div className="min-h-dvh pt-8 pb-20 px-4 sm:px-6 bg-background text-zinc-950">
      <PageWrapper className="max-w-5xl mx-auto space-y-16">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        {/* Modern Hero */}
        <header className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">

          <div className="md:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[0.6875rem] font-mono font-bold uppercase tracking-wider text-zinc-600 shadow-xs w-max">
              <Award className="size-3.5 text-emerald-600" />
              {t("badge")}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.1]">
              {t("title")}
            </h1>
            <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
              {t("description")}
            </p>
          </div>

          {/* Stats Dense Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-xs space-y-1.5 hover:border-zinc-400 transition-[border-color,box-shadow]"
              >
                <span className="text-[0.625rem] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                  {item.sub}
                </span>
                <p className={`font-heading text-2xl font-extrabold tracking-tight ${item.color}`}>{item.value}</p>
                <p className="text-xs text-zinc-500 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Company Story */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-950">
              {t("storyTitle")}
            </h2>
          </div>
          <div className="md:col-span-7 space-y-4 text-base text-zinc-600 leading-relaxed">
            <p>{t("storyP1")}</p>
            <p>{t("storyP2")}</p>
            <p>{t("storyP3")}</p>
          </div>
        </section>

        {/* Venue Partner */}
        <section className="bg-zinc-950 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
              {t("mitraTitle")}
            </span>
            <p className="text-base leading-relaxed text-zinc-200">
              {t("mitraDesc")}
            </p>
          </div>
          <Link
            href="/courts"
            className="inline-flex items-center justify-center rounded-xl text-sm font-bold font-mono bg-white text-zinc-950 hover:bg-zinc-100 min-h-11 h-12 px-6 shrink-0 transition-colors cursor-pointer gap-1.5 shadow-xs"
          >
            <span>{t("ctaButton")}</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </section>

        {/* Pillars Grid */}
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              {t("pillarsDesc")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              {t("pillarsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-background border border-zinc-200/80 rounded-2xl space-y-4 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group"
                >
                  <div className="p-2.5 w-max bg-zinc-100 rounded-xl text-zinc-950 group-hover-fine:bg-zinc-950 group-hover-fine:text-white transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold tracking-tight text-zinc-950">{p.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Action CTA */}
        <section className="relative overflow-hidden bg-zinc-950 rounded-3xl p-10 md:p-14 text-center shadow-xl">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {t("ctaTitle")}
            </h3>
            <p className="text-sm md:text-base text-zinc-300 font-mono">
              {t("ctaDesc")}
            </p>
            <Link
              href="/courts"
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold font-mono bg-white text-zinc-950 hover:bg-zinc-100 min-h-11 h-12 px-8 transition-colors cursor-pointer shadow-xs"
            >
              <span>{t("ctaButton")}</span>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}
