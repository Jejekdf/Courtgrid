import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { Shield, CheckCircle2, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "privacy" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        id: `${BASE_URL}/id/privacy`,
        en: `${BASE_URL}/en/privacy`,
      },
    },
  };
}


export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "privacy" });
  const th = await getTranslations({ locale: locale as "id" | "en", namespace: "header" });

  const breadcrumbItems = [
    { label: th("navBeranda"), href: "/" },
    { label: t("metaTitle") },
  ];

  const summaryItems = [

    t("summaryItem1"),
    t("summaryItem2"),
    t("summaryItem3"),
  ];

  const sections = [
    {
      id: "pengumpulan-data",
      title: t("s1Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s1Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-950 font-semibold">{t("s1Item1Label")} </strong>
                {t("s1Item1Text")}
              </span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-950 font-semibold">{t("s1Item2Label")} </strong>
                {t("s1Item2Text")}
              </span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-950 font-semibold">{t("s1Item3Label")} </strong>
                {t("s1Item3Text")}
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "penggunaan-data",
      title: t("s2Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s2Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "keamanan-data",
      title: t("s3Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s3Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item2")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "cookie",
      title: t("s4Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s4Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "hak-pengguna",
      title: t("s5Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s5Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "retensi-transfer",
      title: t("s6Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s6Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "kontak",
      title: t("s7Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s7Desc")}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-dvh pt-8 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <PageWrapper className="max-w-4xl mx-auto space-y-10">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        {/* Document Header */}
        <header className="border-b border-zinc-200/80 pb-8 space-y-4">

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-[0.6875rem] font-mono font-bold uppercase tracking-wider text-zinc-600">
              <Shield className="size-3.5 text-zinc-950" />
              <span>{t("badge")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-[0.6875rem] font-mono text-zinc-600">
              <Clock className="size-3.5 text-zinc-500" />
              <span>{t("readingTime")}</span>
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 py-1.5">
              <span>{t("effectiveDateLabel")} {t("effectiveDateVal")}</span>
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            {t("title")}
          </h1>

          <p className="text-base text-zinc-600 leading-relaxed max-w-2xl">
            {t("description")}
          </p>

          {/* Plain-Language Key Summary (NN/g + UK BEIS best practice) */}
          <div className="pt-4 border-t border-zinc-200/60">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-950 block mb-2.5">
              {t("summaryTitle")}
            </span>
            <ul className="space-y-2">
              {summaryItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600">
                  <span className="size-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* Content Layout: Sticky Table of Contents & Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of Contents: Mobile Collapsible / Desktop Sticky Sidebar */}
          <aside className="md:col-span-4 md:sticky md:top-28">
            {/* Mobile Collapsible TOC */}
            <details className="md:hidden group p-4 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
              <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-zinc-900 select-none">
                <span className="flex items-center gap-2">
                  <Shield className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>{t("navTitle")} ({sections.length})</span>
                </span>
                <span className="text-xs text-zinc-500 font-mono transition-transform duration-200 group-open:rotate-180">▼</span>
              </summary>
              <nav aria-label={t("navTitle")} className="pt-3 mt-3 border-t border-zinc-100">
                <ul className="space-y-1">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex items-center text-sm text-zinc-700 active:text-zinc-950 font-medium transition-colors py-2.5 px-3 rounded-lg active:bg-zinc-100 min-h-11"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            {/* Desktop Sticky Sidebar TOC */}
            <nav aria-label={t("navTitle")} className="hidden md:block space-y-3 p-5 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 block">
                {t("navTitle")}
              </span>
              <ul className="space-y-1 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-zinc-600 hover-fine:text-zinc-950 font-medium transition-colors hover-fine:underline py-1.5"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Detailed Content Sections */}
          <main className="md:col-span-8 space-y-10">
            {sections.map((s) => (
              <section id={s.id} key={s.id} className="space-y-4 scroll-mt-24 sm:scroll-mt-28">
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-zinc-950">
                  {s.title}
                </h2>
                <div>
                  {s.content}
                </div>
              </section>
            ))}
          </main>
        </div>
      </PageWrapper>
    </div>
  );
}
