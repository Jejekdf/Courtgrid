import Hero from "@/components/layout/Hero";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Award } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "landing" });

  return (
    <div className="flex flex-col bg-[var(--background)] text-zinc-950 min-h-screen">
      <main className="flex-1 w-full">
        {/* Main Hero Component with Framer Motion */}
        <Hero />

        {/* Section 2: Lapangan & Fasilitas */}
        <section id="courts" className="relative py-24 scroll-mt-20 overflow-hidden bg-zinc-50/70 border-t border-zinc-200/80">
          <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">{t("facilityStandard")}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
                  {t("facilityTitle")}
                </h2>
                <p className="text-sm text-zinc-500 max-w-xl font-mono">
                  {t("facilityDesc")}
                </p>
              </div>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center text-sm font-bold font-mono text-zinc-950 hover:text-zinc-600 gap-1.5 group cursor-pointer min-h-11 py-2"
              >
                <span>{t("viewAllCourts")}</span>
                <ArrowRight className="w-4 h-4 transform group-hover-fine:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Futsal Card */}
              <div className="p-8 bg-[var(--background)] border border-zinc-200/80 rounded-3xl space-y-6 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {t("futsalBadge")}
                  </span>
                  <span className="text-sm text-zinc-500 font-mono">{t("futsalStandard")}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">{t("futsalTitle")}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                    {t("futsalDesc")}
                  </p>
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono font-bold text-zinc-700 border-t border-zinc-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t("futsalFeature1")}</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t("futsalFeature2")}</span>
                </div>
              </div>

              {/* Badminton Card */}
              <div className="p-8 bg-[var(--background)] border border-zinc-200/80 rounded-3xl space-y-6 shadow-xs hover:border-zinc-400 transition-[border-color,box-shadow] group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    {t("badmintonBadge")}
                  </span>
                  <span className="text-sm text-zinc-500 font-mono">{t("badmintonStandard")}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-2">{t("badmintonTitle")}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                    {t("badmintonDesc")}
                  </p>
                </div>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono font-bold text-zinc-700 border-t border-zinc-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> {t("badmintonFeature1")}</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> {t("badmintonFeature2")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: About Us & Guarantees */}
        <section id="about" className="relative py-24 bg-[var(--background)] border-t border-zinc-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">{t("commitmentBadge")}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                  {t("commitmentTitle")}
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  {t("commitmentDesc")}
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <p className="text-lg font-extrabold text-zinc-950 font-mono">{t("guaranteedTitle")}</p>
                    </div>
                    <p className="text-sm text-zinc-500 font-mono">{t("guaranteedDesc")}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-zinc-950" />
                      <p className="text-lg font-extrabold text-zinc-950 font-mono">{t("instantStripeTitle")}</p>
                    </div>
                    <p className="text-sm text-zinc-500 font-sans">{t("instantStripeDesc")}</p>
                  </div>
                </div>
              </div>

              {/* Anti-Slop Visual Box */}
              <div className="bg-zinc-950 text-white rounded-3xl p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <div className="text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">{t("officialStandardTitle")}</h3>
                    <p className="text-sm text-zinc-300 font-sans">{t("officialStandardSub")}</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm font-mono text-zinc-100">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">{t("atomicLockLabel")}</span>
                    <span className="text-emerald-400 font-bold">{t("atomicLockVal")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">{t("autoCancelLabel")}</span>
                    <span className="text-white font-bold">{t("autoCancelVal")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">{t("dpMethodLabel")}</span>
                    <span className="text-white font-bold">{t("dpMethodVal")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">{t("ticketVerifyLabel")}</span>
                    <span className="text-white font-bold">{t("ticketVerifyVal")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Callout Booking */}
        <section className="relative py-24 bg-[var(--background)] border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-6">
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
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
