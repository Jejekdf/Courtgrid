import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
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
  const t = await getTranslations("faq");
  const title = `${t("metaTitle")} | CourtGrid`;
  const description = t("metaDesc");
  const url = `${BASE_URL}/${locale}/faq`;

  return {
    title: t("metaTitle"),
    description,
    alternates: {
      canonical: url,
      languages: {
        id: `${BASE_URL}/id/faq`,
        en: `${BASE_URL}/en/faq`,
        "x-default": `${BASE_URL}/faq`,
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

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const th = await getTranslations("header");

  const faqCategories = [
    {
      category: t("categoryPayment"),
      items: [
        { q: t("q1"), a: t("a1") },
        { q: t("q2"), a: t("a2") },
        { q: t("q3"), a: t("a3") },
        { q: t("q4"), a: t("a4") },
        { q: t("q5"), a: t("a5") },
      ],
    },
    {
      category: t("categoryAccount"),
      items: [
        { q: t("q6"), a: t("a6") },
        { q: t("q7"), a: t("a7") },
        { q: t("q8"), a: t("a8") },
      ],
    },
    {
      category: t("categoryTicket"),
      items: [
        { q: t("q9"), a: t("a9") },
        { q: t("q10"), a: t("a10") },
        { q: t("q11"), a: t("a11") },
      ],
    },
    {
      category: t("categoryPolicy"),
      items: [
        { q: t("q12"), a: t("a12") },
        { q: t("q13"), a: t("a13") },
        { q: t("q14"), a: t("a14") },
        { q: t("q15"), a: t("a15") },
      ],
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  const breadcrumbItems = [
    { label: th("navBeranda"), href: "/" },
    { label: t("title") },
  ];

  return (
    <div className="min-h-dvh pt-6 pb-16 px-4 sm:px-6 lg:px-8 bg-background text-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageWrapper className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} locale={locale} />
        <div className="space-y-10 sm:space-y-14">
          {/* Page Header */}
          <header className="border-b border-zinc-200/80 pb-6 sm:pb-8 space-y-3.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200/90 bg-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-700 shadow-xs font-sans">
            <HelpCircle className="size-3.5 text-zinc-950" aria-hidden="true" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 text-balance">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans text-pretty">
            {t("description")}
          </p>
        </header>

        {/* FAQ Accordion List */}
        <main className="space-y-10 sm:space-y-12">
          {faqCategories.map((cat, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 pt-8 first:pt-0 border-t border-zinc-200/80 first:border-t-0 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600 block mb-1.5 font-sans">
                  {t("badge")}
                </span>
                <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-950 text-balance">
                  {cat.category}
                </h2>
              </div>
              <div className="lg:col-span-8 border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-white shadow-xs">
                <Accordion className="w-full divide-y divide-zinc-100">
                  {cat.items.map((faq, i) => (
                    <AccordionItem key={i} value={`cat-${idx}-item-${i}`} className="border-b-0 px-3 sm:px-5">
                      <AccordionTrigger className="text-left text-zinc-950 font-bold hover-fine:text-zinc-700 text-base sm:text-lg py-4 sm:py-5 cursor-pointer min-h-12 text-balance">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-600 leading-relaxed text-sm sm:text-base pb-5 pt-1 text-pretty font-sans">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </main>
        </div>
      </PageWrapper>
    </div>
  );
}

