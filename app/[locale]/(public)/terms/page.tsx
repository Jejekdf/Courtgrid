import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";

const BASE_URL = "https://courtgrid-one.vercel.app";

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
    alternates: {
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        id: `${BASE_URL}/id/terms`,
        en: `${BASE_URL}/en/terms`,
      },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "terms" });
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
      id: "ketentuan-dp",
      title: t("s1Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s1DescLead")}
            <strong className="text-zinc-950 font-semibold">{t("s1DescBold")}</strong>
            {t("s1DescTrail")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "batas-waktu",
      title: t("s2Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s2DescLead")}
            <strong className="text-zinc-950 font-semibold">{t("s2DescBold")}</strong>
            {t("s2DescTrail")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item2")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "tata-tertib",
      title: t("s3Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s3Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item2")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "definisi",
      title: t("s4Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s4Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item3")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item4")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "akun-pengguna",
      title: t("s5Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s5Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "batasan-tanggung-jawab",
      title: t("s6Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s6Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item2")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item3")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "perubahan-ketentuan",
      title: t("s7Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s7Desc")}
          </p>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s7Item1")}</span>
            </li>
            <li className="py-3 flex items-start gap-3 text-sm text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s7Item2")}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "kontak",
      title: t("s8Title"),
      content: (
        <div className="space-y-4">
          <p className="text-base text-zinc-600 leading-relaxed">
            {t("s8Desc")}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <PageWrapper className="max-w-4xl mx-auto space-y-10">
        <Breadcrumb items={breadcrumbItems} />
        {/* Document Header */}
        <header className="border-b border-zinc-200/80 pb-8 space-y-4">

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600">
              <FileText className="w-3.5 h-3.5 text-zinc-950" />
              <span>{t("badge")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-mono text-zinc-600">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
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
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* Content Layout: Sticky Table of Contents & Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (Sidebar) */}
          <nav aria-label={t("navTitle")} className="md:col-span-4 sticky top-28 space-y-3 p-5 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
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

          {/* Detailed Legal Sections */}
          <main className="md:col-span-8 space-y-10">
            {sections.map((s) => (
              <section id={s.id} key={s.id} className="space-y-4 scroll-mt-28">
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
