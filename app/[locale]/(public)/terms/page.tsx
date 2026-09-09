import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import { FileText, CheckCircle2 } from "lucide-react";
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
  const t = await getTranslations("terms");
  const title = `${t("metaTitle")} | CourtGrid`;
  const description = t("metaDesc");
  const url = `${BASE_URL}/${locale}/terms`;

  return {
    title: t("metaTitle"),
    description,
    alternates: {
      canonical: url,
      languages: {
        id: `${BASE_URL}/id/terms`,
        en: `${BASE_URL}/en/terms`,
        "x-default": `${BASE_URL}/terms`,
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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");
  const th = await getTranslations("header");

  const breadcrumbItems = [
    { label: th("navBeranda"), href: "/" },
    { label: t("title") },
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s1DescLead")}
            <strong className="text-zinc-950 font-semibold">{t("s1DescBold")}</strong>
            {t("s1DescTrail")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s1Item2")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s2DescLead")}
            <strong className="text-zinc-950 font-semibold">{t("s2DescBold")}</strong>
            {t("s2DescTrail")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s2Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s3Desc")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s3Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s4Desc")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item2")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s4Item3")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s5Desc")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s5Item2")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s6Desc")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s6Item2")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s7Desc")}
          </p>
          <ul className="space-y-3">
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t("s7Item1")}</span>
            </li>
            <li className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
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
          <p className="text-base text-zinc-600 leading-relaxed text-pretty">
            {t("s8Desc")}
          </p>
          <a
            href="mailto:info@courtgrid.com"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-zinc-950 hover:text-emerald-700 underline underline-offset-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm"
          >
            info@courtgrid.com
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-dvh pt-6 pb-16 px-4 sm:px-6 lg:px-8 bg-background text-zinc-950">
      <PageWrapper className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        <div className="space-y-10 sm:space-y-12">
          {/* Document Header */}
          <header className="border-b border-zinc-200/80 pb-6 sm:pb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-zinc-500 font-sans">
              <span className="font-semibold text-zinc-900">{t("badge")}</span>
              <span className="text-zinc-300" aria-hidden="true">/</span>
              <span>{t("effectiveDateLabel")} {t("effectiveDateVal")}</span>
              <span className="text-zinc-300" aria-hidden="true">/</span>
              <span>{t("readingTime")}</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 text-balance">
              {t("title")}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl font-sans text-pretty">
              {t("description")}
            </p>

            {/* Plain-Language Key Summary */}
            <div className="mt-6 p-5 sm:p-6 bg-zinc-50 border border-zinc-200/90 rounded-2xl">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 block mb-3 font-sans">
                {t("summaryTitle")}
              </span>
              <ul className="space-y-2.5">
                {summaryItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans text-pretty">
                    <span className="size-2 rounded-full bg-zinc-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          {/* Content Layout: Sticky Table of Contents & Main Sections */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
            {/* Table of Contents: Mobile Collapsible / Desktop Sticky Sidebar */}
            <aside className="md:col-span-4 xl:col-span-3 md:sticky md:top-28">
              {/* Mobile Collapsible TOC */}
              <details className="md:hidden group p-4 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-zinc-900 select-none">
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{t("navTitle")} ({sections.length})</span>
                  </span>
                  <span className="text-[0.6875rem] text-zinc-500 font-sans transition-transform duration-200 group-open:rotate-180">▼</span>
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
              <nav aria-label={t("navTitle")} className="hidden md:block space-y-3.5 p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200/90 shadow-xs">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 block font-sans">
                  {t("navTitle")}
                </span>
                <ul className="space-y-1 text-sm sm:text-base">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block text-zinc-600 hover-fine:text-zinc-950 hover-fine:bg-zinc-100/80 font-medium transition-colors px-3 py-2 rounded-lg -mx-1"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Detailed Legal Sections */}
            <main className="md:col-span-8 xl:col-span-9 space-y-12 max-w-3xl">
              {sections.map((s) => (
                <section id={s.id} key={s.id} className="space-y-4 scroll-mt-24 sm:scroll-mt-28">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 text-balance">
                    {s.title}
                  </h2>
                  <div>
                    {s.content}
                  </div>
                </section>
              ))}
            </main>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
