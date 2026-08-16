import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { ShieldCheck, Clock, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "terms" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "terms" });

  const sections = [
    {
      id: "ketentuan-dp",
      title: t("s1Title"),
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            {t("s1DescLead")}
            <strong className="text-zinc-950 font-bold">{t("s1DescBold")}</strong>
            {t("s1DescTrail")}
          </p>
          <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item1")}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item2")}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item3")}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "batas-waktu",
      title: t("s2Title"),
      icon: Clock,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            {t("s2DescLead")}
            <strong className="text-zinc-950 font-bold">{t("s2DescBold")}</strong>
            {t("s2DescTrail")}
          </p>
          <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item1")}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item2")}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tata-tertib",
      title: t("s3Title"),
      icon: AlertTriangle,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            {t("s3Desc")}
          </p>
          <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item1")}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-zinc-700 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item2")}</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <PageWrapper className="max-w-4xl mx-auto space-y-10">
        {/* Document Header */}
        <header className="border-b border-zinc-200/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-mono font-bold text-zinc-600 shadow-xs">
            <FileText className="w-3.5 h-3.5 text-zinc-950" />
            <span>{t("badge")}</span>
            <span>•</span>
            <span>{t("lastUpdatedLabel")} {t("lastUpdatedVal")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-500 font-sans leading-relaxed max-w-2xl">
            {t("description")}
          </p>
        </header>

        {/* Content Layout: Sticky Table of Contents & Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (Sidebar) */}
          <nav className="md:col-span-4 sticky top-28 space-y-3 p-5 bg-[var(--background)] rounded-2xl border border-zinc-200/80 shadow-xs">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              {t("navTitle")}
            </span>
            <ul className="space-y-2 text-sm font-sans">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-zinc-600 hover-fine:text-zinc-950 font-bold transition-colors hover-fine:underline min-h-11 py-1"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Detailed Legal Sections */}
          <main className="md:col-span-8 space-y-8 divide-y divide-zinc-100">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <section id={s.id} key={s.id} className="pt-8 first:pt-0 space-y-4 scroll-mt-28">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-zinc-950">{s.title}</h2>
                  </div>
                  <div>
                    {s.content}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </PageWrapper>
    </div>
  );
}
