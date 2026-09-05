import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, QrCode } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getActiveCourtsDAL } from "@/features/courts/dal";

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "landing" });
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
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "landing" });
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
    priceRange: `Rp ${minOverallPrice.toLocaleString("id-ID")} - Rp ${maxOverallPrice.toLocaleString("id-ID")}`,
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
          description: `${court.type === "FUTSAL" ? "Synthetic turf futsal court" : "PVC anti-slip badminton court"} - Rp ${court.pricePerHour.toLocaleString("id-ID")}/jam`,
        },
      })),
    },
  };

  return (
    <div className="flex flex-col bg-[var(--background)] text-zinc-950 min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <main className="flex-1 w-full">
        {/* Main Hero Component with Dynamic Realtime Courts */}
        <Hero courts={courts} />

        {/* Section 2: Lapangan & Fasilitas */}
        <section id="courts" className="relative py-10 sm:py-14 lg:py-16 scroll-mt-20 overflow-hidden bg-zinc-50/60 border-t border-zinc-200/80">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-sans">{t("facilityStandard")}</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950">
                  {t("facilityTitle")}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 max-w-xl font-sans leading-relaxed">
                  {t("facilityDesc")}
                </p>
              </div>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center text-sm font-bold text-zinc-950 hover:text-emerald-700 gap-1.5 group cursor-pointer py-1 self-start md:self-end transition-colors"
              >
                <span>{t("viewAllCourts")}</span>
                <ArrowRight className="size-4 transform group-hover-fine:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Futsal Card */}
              <div className="p-6 sm:p-8 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                      {t("futsalBadge", { count: futsalCourts.length })}
                    </span>
                    <span className="text-sm text-emerald-700 font-bold tabular-nums">
                      {t("fromPrice", { price: futsalMinPrice.toLocaleString("id-ID") })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">{t("futsalTitle")}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed font-sans text-pretty">
                      {t("futsalDesc")}
                    </p>
                  </div>

                  {futsalCourts.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {futsalCourts.map((court) => (
                        <Link
                          key={court.id}
                          href="/dashboard/book"
                          className="text-xs font-semibold px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors"
                        >
                          {court.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" /> {t("futsalFeature1")}</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" /> {t("futsalFeature2")}</span>
                  </div>
                  <Link
                    href="/dashboard/book"
                    className="text-xs font-bold text-zinc-950 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors min-h-11 items-center"
                  >
                    <span>Pesan Futsal</span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Badminton Card */}
              <div className="p-6 sm:p-8 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
                      {t("badmintonBadge", { count: badmintonCourts.length })}
                    </span>
                    <span className="text-sm text-sky-700 font-bold tabular-nums">
                      {t("fromPrice", { price: badmintonMinPrice.toLocaleString("id-ID") })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">{t("badmintonTitle")}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed font-sans text-pretty">
                      {t("badmintonDesc")}
                    </p>
                  </div>

                  {badmintonCourts.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {badmintonCourts.map((court) => (
                        <Link
                          key={court.id}
                          href="/dashboard/book"
                          className="text-xs font-semibold px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors"
                        >
                          {court.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-sky-600 shrink-0" aria-hidden="true" /> {t("badmintonFeature1")}</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-sky-600 shrink-0" aria-hidden="true" /> {t("badmintonFeature2")}</span>
                  </div>
                  <Link
                    href="/dashboard/book"
                    className="text-xs font-bold text-zinc-950 hover:text-sky-700 inline-flex items-center gap-1 transition-colors min-h-11 items-center"
                  >
                    <span>Pesan Badminton</span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Nilai Utama & Kepastian Jadwal */}
        <section id="about" className="relative py-10 sm:py-14 lg:py-16 bg-[var(--background)] border-t border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-sans">{t("commitmentBadge")}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 leading-tight text-balance">
                {t("commitmentTitle")}
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed font-sans text-pretty">
                {t("commitmentDesc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950">{t("guaranteedTitle")}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans text-pretty">{t("guaranteedDesc")}</p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Zap className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950">{t("instantStripeTitle")}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans text-pretty">{t("instantStripeDesc")}</p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <QrCode className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950">E-Ticket QR Digital</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans text-pretty">Check-in praktis langsung scan di resepsionis venue tanpa antre dan tanpa cetak tiket kertas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Alur Booking Tanpa Ribet */}
        <section className="relative py-10 sm:py-14 lg:py-16 bg-zinc-50/60 border-t border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 font-sans">{t("guideBadge")}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("guideTitle")}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 font-sans text-pretty">
                {t("guideDesc")}
              </p>
            </div>

            {/* Streamlined Step Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-3 p-5 bg-white sm:bg-transparent rounded-2xl border border-zinc-200/80 sm:border-0 shadow-2xs sm:shadow-none sm:p-0">
                <div className="size-9 rounded-xl bg-zinc-950 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  1
                </div>
                <h3 className="text-base font-bold text-zinc-950">{t("step1Title")}</h3>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">{t("step1Desc")}</p>
              </div>

              <div className="space-y-3 p-5 bg-white sm:bg-transparent rounded-2xl border border-zinc-200/80 sm:border-0 shadow-2xs sm:shadow-none sm:p-0">
                <div className="size-9 rounded-xl bg-zinc-950 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  2
                </div>
                <h3 className="text-base font-bold text-zinc-950">{t("step2Title")}</h3>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">{t("step2Desc")}</p>
              </div>

              <div className="space-y-3 p-5 bg-white sm:bg-transparent rounded-2xl border border-zinc-200/80 sm:border-0 shadow-2xs sm:shadow-none sm:p-0">
                <div className="size-9 rounded-xl bg-zinc-950 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  3
                </div>
                <h3 className="text-base font-bold text-zinc-950">{t("step3Title")}</h3>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">{t("step3Desc")}</p>
              </div>

              <div className="space-y-3 p-5 bg-white sm:bg-transparent rounded-2xl border border-zinc-200/80 sm:border-0 shadow-2xs sm:shadow-none sm:p-0">
                <div className="size-9 rounded-xl bg-zinc-950 text-white text-sm font-bold flex items-center justify-center shadow-xs">
                  4
                </div>
                <h3 className="text-base font-bold text-zinc-950">{t("step4Title")}</h3>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed text-pretty">{t("step4Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Callout Booking */}
        <section className="relative py-10 sm:py-14 lg:py-16 bg-[var(--background)] border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-zinc-950 rounded-2xl sm:rounded-3xl p-7 sm:p-10 lg:p-12 flex flex-col items-center text-center gap-5 sm:gap-6 shadow-lg">
              <div className="relative z-10 space-y-3 max-w-2xl">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 font-sans">{t("onlineBookingBadge")}</span>
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  {t("ctaTitle")}
                </h3>
                <p className="text-zinc-300 text-sm sm:text-base font-sans">
                  {t("ctaDesc")}
                </p>
              </div>
              
              <Link
                href="/dashboard/book"
                className="relative z-10 inline-flex items-center justify-center rounded-xl text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] min-h-12 h-12 px-8 transition-all duration-150 cursor-pointer shadow-sm group"
              >
                <span>{t("ctaButton")}</span>
                <ArrowRight className="ml-2 size-4 transform group-hover-fine:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
