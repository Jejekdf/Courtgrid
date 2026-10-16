import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, QrCode } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getActiveCourtsDAL } from "@/features/courts/dal";
import { formatRupiah } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";

const BASE_URL = SITE_URL;

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const title = `${t("metaTitle")} | CourtGrid`;
  const description = t("metaDesc");

  return {
    title: t("metaTitle"),
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        id: `${BASE_URL}/id`,
        en: `${BASE_URL}/en`,
        "x-default": BASE_URL,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: "CourtGrid",
      locale: locale === "id" ? "id_ID" : "en_US",
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "CourtGrid Sport Center",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const courts = await getActiveCourtsDAL("", null);

  const futsalCourts = courts.filter((c) => c.type === "FUTSAL");
  const badmintonCourts = courts.filter((c) => c.type === "BADMINTON");

  const futsalMinPrice =
    futsalCourts.length > 0 ? Math.min(...futsalCourts.map((c) => c.pricePerHour)) : 150000;
  const badmintonMinPrice =
    badmintonCourts.length > 0 ? Math.min(...badmintonCourts.map((c) => c.pricePerHour)) : 50000;

  const allPrices = courts.map((c) => c.pricePerHour);
  const minOverallPrice = allPrices.length > 0 ? Math.min(...allPrices) : 50000;
  const maxOverallPrice = allPrices.length > 0 ? Math.max(...allPrices) : 150000;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "CourtGrid Sport Center",
    image: `${BASE_URL}/og-image.png`,
    url: `${BASE_URL}/${locale}`,
    telephone: "+6287746288262",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Sisingamangaraja No. 12",
      addressLocality: "Kebayoran Baru",
      addressRegion: "Jakarta Selatan",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.2447,
      longitude: 106.7958,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "06:00",
        closes: "23:00",
      },
    ],
    priceRange: `${formatRupiah(minOverallPrice)} - ${formatRupiah(maxOverallPrice)}`,
    currenciesAccepted: "IDR",
    paymentAccepted: "Credit Card, Bank Transfer, QRIS",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "DKI Jakarta",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Court Catalog",
      itemListElement: courts.map((court) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: court.name,
          description: `${court.type === "FUTSAL" ? "Synthetic turf futsal court" : "PVC anti-slip badminton court"} - ${formatRupiah(court.pricePerHour)}/jam`,
        },
      })),
    },
  };

  return (
    <div className="flex flex-col bg-background text-zinc-950 min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <main className="flex-1 w-full">
        {/* Main Hero Component with Dynamic Realtime Courts */}
        <Hero courts={courts} />

        {/* Section 2: Lapangan & Fasilitas */}
        <section id="courts" className="relative py-10 sm:py-14 lg:py-16 xl:py-20 scroll-mt-20 overflow-hidden bg-zinc-50/60 border-t border-zinc-200/80">
          <div className="relative z-10 max-w-7xl xl:max-w-340 2xl:max-w-390 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-8 sm:space-y-10 xl:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-950 text-balance">
                  {t("facilityTitle")}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 max-w-xl xl:max-w-2xl font-sans leading-relaxed">
                  {t("facilityDesc")}
                </p>
              </div>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center text-sm sm:text-base font-bold text-zinc-950 hover:text-emerald-700 gap-1.5 group cursor-pointer py-1 self-start md:self-end transition-colors"
              >
                <span>{t("viewAllCourts")}</span>
                <ArrowRight className="size-4 xl:size-4.5 transform group-hover-fine:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-10">
              {/* Futsal Card */}
              <div className="p-5 sm:p-8 lg:p-9 xl:p-10 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs hover:border-zinc-300 hover:shadow-md transition-[border-color,box-shadow] duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 whitespace-nowrap">
                      {t("futsalBadge", { count: futsalCourts.length })}
                    </span>
                    <span className="text-sm sm:text-base text-emerald-700 font-bold tabular-nums whitespace-nowrap">
                      {t("fromPrice", { price: futsalMinPrice.toLocaleString("id-ID") })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-zinc-950 mb-2">{t("futsalTitle")}</h3>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                      {t("futsalDesc")}
                    </p>
                  </div>

                  {futsalCourts.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {futsalCourts.map((court) => (
                        <Link
                          key={court.id}
                          href="/dashboard/book"
                          className="text-xs sm:text-sm font-semibold px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200/90 rounded-lg transition-colors"
                        >
                          {court.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 xl:pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-600">
                    <span className="flex items-center gap-2 whitespace-nowrap"><CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" /> {t("futsalFeature1")}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap"><CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" /> {t("futsalFeature2")}</span>
                  </div>
                  <Link
                    href="/dashboard/book"
                    className="text-sm sm:text-base font-bold text-zinc-950 hover:text-emerald-700 inline-flex items-center gap-1.5 transition-colors min-h-11 sm:min-h-12 whitespace-nowrap"
                  >
                    <span>{t("bookFutsal")}</span>
                    <ArrowRight className="size-4 xl:size-4.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Badminton Card */}
              <div className="p-5 sm:p-8 lg:p-9 xl:p-10 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs hover:border-zinc-300 hover:shadow-md transition-[border-color,box-shadow] duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                    <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/80 whitespace-nowrap">
                      {t("badmintonBadge", { count: badmintonCourts.length })}
                    </span>
                    <span className="text-sm sm:text-base text-sky-700 font-bold tabular-nums whitespace-nowrap">
                      {t("fromPrice", { price: badmintonMinPrice.toLocaleString("id-ID") })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-zinc-950 mb-2">{t("badmintonTitle")}</h3>
                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                      {t("badmintonDesc")}
                    </p>
                  </div>

                  {badmintonCourts.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {badmintonCourts.map((court) => (
                        <Link
                          key={court.id}
                          href="/dashboard/book"
                          className="text-xs sm:text-sm font-semibold px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200/90 rounded-lg transition-colors"
                        >
                          {court.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 xl:pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-600">
                    <span className="flex items-center gap-2 whitespace-nowrap"><CheckCircle2 className="size-4 text-sky-600 shrink-0" aria-hidden="true" /> {t("badmintonFeature1")}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap"><CheckCircle2 className="size-4 text-sky-600 shrink-0" aria-hidden="true" /> {t("badmintonFeature2")}</span>
                  </div>
                  <Link
                    href="/dashboard/book"
                    className="text-sm sm:text-base font-bold text-zinc-950 hover:text-sky-700 inline-flex items-center gap-1.5 transition-colors min-h-11 sm:min-h-12 whitespace-nowrap"
                  >
                    <span>{t("bookBadminton")}</span>
                    <ArrowRight className="size-4 xl:size-4.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Nilai Utama & Kepastian Jadwal */}
        <section id="about" className="relative py-12 sm:py-16 lg:py-20 xl:py-24 bg-background border-t border-zinc-200/80">
          <div className="max-w-7xl xl:max-w-340 2xl:max-w-390 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-8 sm:space-y-10 xl:space-y-12">
            <div className="max-w-3xl xl:max-w-4xl space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight text-balance">
                {t("commitmentTitle")}
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans text-pretty">
                {t("commitmentDesc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 xl:gap-8">
              <div className="p-6 sm:p-7 xl:p-8 rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 sm:size-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-5 sm:size-5.5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base sm:text-lg xl:text-xl font-bold text-zinc-950 leading-snug text-balance">
                    {t("guaranteedTitle")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("guaranteedDesc")}
                </p>
              </div>

              <div className="p-6 sm:p-7 xl:p-8 rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 sm:size-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Zap className="size-5 sm:size-5.5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base sm:text-lg xl:text-xl font-bold text-zinc-950 leading-snug text-balance">
                    {t("instantStripeTitle")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("instantStripeDesc")}
                </p>
              </div>

              <div className="p-6 sm:p-7 xl:p-8 rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 sm:size-11 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0">
                    <QrCode className="size-5 sm:size-5.5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base sm:text-lg xl:text-xl font-bold text-zinc-950 leading-snug text-balance">
                    {t("eticketFeatureTitle")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                  {t("eticketFeatureDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Alur Booking Tanpa Ribet */}
        <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24 bg-zinc-50/60 border-t border-zinc-200/80">
          <div className="max-w-7xl xl:max-w-340 2xl:max-w-390 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-8 sm:space-y-10 xl:space-y-12">
            <div className="text-center max-w-2xl xl:max-w-3xl mx-auto space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("guideTitle")}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 font-sans text-pretty">
                {t("guideDesc")}
              </p>
            </div>

            {/* Streamlined Step Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 sm:size-9 rounded-lg bg-zinc-950 text-white text-sm sm:text-base font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950 leading-snug text-balance">
                    {t("step1Title")}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">
                  {t("step1Desc")}
                </p>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 sm:size-9 rounded-lg bg-zinc-950 text-white text-sm sm:text-base font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950 leading-snug text-balance">
                    {t("step2Title")}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">
                  {t("step2Desc")}
                </p>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 sm:size-9 rounded-lg bg-zinc-950 text-white text-sm sm:text-base font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950 leading-snug text-balance">
                    {t("step3Title")}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">
                  {t("step3Desc")}
                </p>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 sm:size-9 rounded-lg bg-zinc-950 text-white text-sm sm:text-base font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                    4
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-950 leading-snug text-balance">
                    {t("step4Title")}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">
                  {t("step4Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Callout Booking */}
        <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24 bg-background border-t border-zinc-200">
          <div className="max-w-7xl xl:max-w-340 2xl:max-w-390 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="relative overflow-hidden bg-zinc-950 rounded-2xl sm:rounded-3xl p-7 sm:p-10 lg:p-12 xl:p-14 flex flex-col items-center text-center gap-5 sm:gap-6 shadow-md">
              <div className="relative z-10 space-y-3.5 max-w-2xl xl:max-w-3xl">
                <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
                  {t("ctaTitle")}
                </h3>
                <p className="text-zinc-300 text-sm sm:text-base xl:text-lg font-sans max-w-xl xl:max-w-2xl text-pretty">
                  {t("ctaDesc")}
                </p>
              </div>
              
              <Link
                href="/dashboard/book"
                className="relative z-10 inline-flex items-center justify-center rounded-xl text-sm sm:text-base font-bold bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] min-h-11 sm:min-h-12 h-11 sm:h-12 px-7 sm:px-8 transition-[background-color,transform] duration-150 cursor-pointer shadow-xs group whitespace-nowrap"
              >
                <span>{t("ctaButton")}</span>
                <ArrowRight className="ml-2 size-4 sm:size-4.5 transform group-hover-fine:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
