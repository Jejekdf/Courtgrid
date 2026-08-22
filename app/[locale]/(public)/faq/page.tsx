import { Metadata } from "next";
import PageWrapper from "@/components/ui/PageWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/faq`,
      languages: {
        id: `${BASE_URL}/id/faq`,
        en: `${BASE_URL}/en/faq`,
      },
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "faq" });
  const th = await getTranslations({ locale: locale as "id" | "en", namespace: "header" });

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
    { label: t("metaTitle") },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[var(--background)] text-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageWrapper className="max-w-4xl mx-auto space-y-10">
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <header className="border-b border-zinc-200/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-950" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
            {t("description")}
          </p>
        </header>

        {/* FAQ Accordion List */}
        <main className="space-y-8">
          {faqCategories.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 block">
                {cat.category}
              </span>
              <div className="border border-zinc-200/80 rounded-xl p-2 bg-white shadow-xs">
                <Accordion className="w-full divide-y divide-zinc-100">
                  {cat.items.map((faq, i) => (
                    <AccordionItem key={i} value={`cat-${idx}-item-${i}`} className="border-b-0 px-3">
                      <AccordionTrigger className="text-left text-zinc-950 font-semibold hover-fine:text-zinc-700 text-sm py-4 cursor-pointer min-h-11">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-600 leading-relaxed text-sm pb-4 pt-1">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </main>
      </PageWrapper>
    </div>
  );
}

