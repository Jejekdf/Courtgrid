import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Zap, ShieldCheck, Building2, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

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
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "about" });

  const stats = [
    { label: t("stats.arenasLabel"), value: t("stats.arenas"), sub: t("stats.arenasSub") },
    { label: t("stats.dpLabel"), value: t("stats.dp"), sub: t("stats.dpSub") },
    { label: t("stats.timeLabel"), value: t("stats.time"), sub: t("stats.timeSub") },
    { label: t("stats.securityLabel"), value: t("stats.security"), sub: t("stats.securitySub") },
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <PageWrapper className="max-w-4xl mx-auto space-y-12">
        {/* Header Document */}
        <header className="border-b border-zinc-200 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span>{t("breadcrumbCompany")}</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold">{t("breadcrumbAbout")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
            {t("description")}
          </p>
        </header>

        {/* Operational Metrics (Dense Baseline-UI Grid) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-1"
            >
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {item.sub}
              </span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">{item.value}</p>
              <p className="text-sm text-zinc-500 font-medium">{item.label}</p>
            </div>
          ))}
        </section>

        {/* Pillars of Service (Simple List with Divider) */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950">
              {t("pillarsTitle")}
            </h2>
            <p className="text-sm text-zinc-500">
              {t("pillarsDesc")}
            </p>
          </div>

          <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="py-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="p-2 w-max bg-zinc-100/80 rounded-lg text-zinc-950 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-950">{p.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Action Link */}
        <section className="bg-zinc-950 rounded-xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold">{t("ctaTitle")}</h3>
            <p className="text-sm text-zinc-400">
              {t("ctaDesc")}
            </p>
          </div>
          <Link
            href="/courts"
            className="px-4 py-2.5 min-h-11 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>{t("ctaButton")}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </PageWrapper>
    </div>
  );
}
