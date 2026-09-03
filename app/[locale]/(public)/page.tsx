import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, CalendarDays, Lock, CreditCard, QrCode } from "lucide-react";
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
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        id: `${BASE_URL}/id`,
        en: `${BASE_URL}/en`,
        "x-default": BASE_URL,
      },
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
    url: BASE_URL,
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
    paymentAccepted: "Credit Card, QRIS, Stripe",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "DKI Jakarta",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128",
      bestRating: "5",
      worstRating: "1",
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
        <section id="courts" className="relative py-24 scroll-mt-20 overflow-hidden bg-zinc-50/70 border-t border-zinc-200/80">
          <div className="relative z-10 max-w-7xl 2xl:max-w-[88rem] mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600">{t("facilityStandard")}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
                  {t("facilityTitle")}
                </h2>
                <p className="text-sm text-zinc-600 max-w-xl font-mono">
                  {t("facilityDesc")}
                </p>
              </div>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center text-sm font-bold font-mono text-zinc-950 hover:text-zinc-600 gap-1.5 group cursor-pointer min-h-11 py-2"
              >
                <span>{t("viewAllCourts")}</span>
                <ArrowRight className="size-4 transform group-hover-fine:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Futsal Card */}
              <div className="p-8 bg-[var(--background)] border border-zinc-200/80 rounded-3xl space-y-6 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {t("futsalBadge", { count: futsalCourts.length })}
                  </span>
                  <span className="text-sm text-emerald-700 font-mono font-bold">
                    {t("fromPrice", { price: futsalMinPrice.toLocaleString("id-ID") })}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">{t("futsalTitle")}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed font-mono">
                    {t("futsalDesc")}
                  </p>
                  {futsalCourts.length > 0 && (
                    <div className="pt-3 flex flex-wrap gap-2">
                      {futsalCourts.map((court) => (
                        <span
                          key={court.id}
                          className="text-[0.6875rem] font-mono font-semibold px-2.5 py-1 bg-emerald-50/80 text-emerald-900 border border-emerald-200/60 rounded-lg"
                        >
                          {court.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono font-bold text-zinc-700 border-t border-zinc-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" /> {t("futsalFeature1")}</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" /> {t("futsalFeature2")}</span>
                </div>
              </div>

              {/* Badminton Card */}
              <div className="p-8 bg-[var(--background)] border border-zinc-200/80 rounded-3xl space-y-6 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-mono uppercase font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    {t("badmintonBadge", { count: badmintonCourts.length })}
                  </span>
                  <span className="text-sm text-sky-700 font-mono font-bold">
                    {t("fromPrice", { price: badmintonMinPrice.toLocaleString("id-ID") })}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">{t("badmintonTitle")}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed font-mono">
                    {t("badmintonDesc")}
                  </p>
                  {badmintonCourts.length > 0 && (
                    <div className="pt-3 flex flex-wrap gap-2">
                      {badmintonCourts.map((court) => (
                        <span
                          key={court.id}
                          className="text-[0.6875rem] font-mono font-semibold px-2.5 py-1 bg-sky-50/80 text-sky-900 border border-sky-200/60 rounded-lg"
                        >
                          {court.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono font-bold text-zinc-700 border-t border-zinc-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-sky-600 shrink-0" aria-hidden="true" /> {t("badmintonFeature1")}</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-sky-600 shrink-0" aria-hidden="true" /> {t("badmintonFeature2")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: About Us & Guarantees */}
        <section id="about" className="relative py-24 bg-[var(--background)] border-t border-zinc-200/80">
          <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600">{t("commitmentBadge")}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                {t("commitmentTitle")}
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed font-sans">
                {t("commitmentDesc")}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                <div className="p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-emerald-600" aria-hidden="true" />
                    <p className="text-lg font-extrabold text-zinc-950 font-mono">{t("guaranteedTitle")}</p>
                  </div>
                  <p className="text-sm text-zinc-600 font-mono">{t("guaranteedDesc")}</p>
                </div>
                <div className="p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="size-5 text-zinc-950" aria-hidden="true" />
                    <p className="text-lg font-extrabold text-zinc-950 font-mono">{t("instantStripeTitle")}</p>
                  </div>
                  <p className="text-sm text-zinc-600 font-sans">{t("instantStripeDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Reservation Guide (How It Works) */}
        <section className="relative py-20 bg-zinc-50/70 border-t border-zinc-200/80">
          <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
                {t("guideTitle")}
              </h2>
              <p className="text-sm text-zinc-600 font-mono">
                {t("guideDesc")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-[var(--background)] border border-zinc-200/80 rounded-2xl space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                  <CalendarDays className="size-5 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-bold text-zinc-950">{t("step1Title")}</h3>
                <p className="text-xs text-zinc-600 font-mono leading-relaxed">{t("step1Desc")}</p>
              </div>

              <div className="p-6 bg-[var(--background)] border border-zinc-200/80 rounded-2xl space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                  <Lock className="size-5 text-zinc-950" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-bold text-zinc-950">{t("step2Title")}</h3>
                <p className="text-xs text-zinc-600 font-mono leading-relaxed">{t("step2Desc")}</p>
              </div>

              <div className="p-6 bg-[var(--background)] border border-zinc-200/80 rounded-2xl space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                  <CreditCard className="size-5 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-bold text-zinc-950">{t("step3Title")}</h3>
                <p className="text-xs text-zinc-600 font-mono leading-relaxed">{t("step3Desc")}</p>
              </div>

              <div className="p-6 bg-[var(--background)] border border-zinc-200/80 rounded-2xl space-y-3 shadow-xs">
                <div className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                  <QrCode className="size-5 text-zinc-950" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-bold text-zinc-950">{t("step4Title")}</h3>
                <p className="text-xs text-zinc-600 font-mono leading-relaxed">{t("step4Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Callout Booking */}
        <section className="relative py-24 bg-[var(--background)] border-t border-zinc-200">
          <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-6">
            <div className="relative overflow-hidden bg-zinc-950 rounded-3xl p-10 md:p-16 flex flex-col items-center text-center gap-8 shadow-xl">
              <div className="relative z-10 space-y-4 max-w-2xl">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">{t("onlineBookingBadge")}</span>
                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  {t("ctaTitle")}
                </h3>
                <p className="text-zinc-300 text-sm md:text-base font-mono">
                  {t("ctaDesc")}
                </p>
              </div>
              
              <Link
                href="/dashboard/book"
                className="relative z-10 inline-flex items-center justify-center rounded-xl text-sm font-bold font-mono bg-white text-zinc-950 hover:bg-zinc-100 min-h-11 h-12 px-8 shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                <span>{t("ctaButton")}</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
