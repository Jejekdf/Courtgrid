"use client";

import RegisterForm from "@/components/RegisterForm";
import { Link } from "@/i18n/navigation";
import { Quote, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const ta = useTranslations("auth");

  return (
    <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[var(--background)] text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-5xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col lg:flex-row-reverse">
        {/* Right Panel: Auth Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-10 md:px-12 py-8 sm:py-10 relative">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("title")}
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed text-pretty">
                {t("desc")}
              </p>
            </div>

            {/* Register Form */}
            <div>
              <RegisterForm />
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-zinc-500 pt-2">
              {t("haveAccount")}{" "}
              <Link
                href="/login"
                className="font-bold text-zinc-950 underline underline-offset-4 hover:text-zinc-700 transition-colors"
              >
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </div>

        {/* Left Panel: Visual Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-5/12 bg-zinc-950 relative overflow-hidden flex-col justify-between p-8 xl:p-10 border-r border-zinc-900 min-h-[480px]">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-[url('/badminton1.webp')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-700 hover-fine:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          
          {/* Anti-Slop Pill */}
          <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 w-max shadow-xs">
            <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-sans">
              {ta("guaranteeSchedule")}
            </span>
          </div>

          {/* Testimonial Quote Content */}
          <div className="relative z-10 flex flex-col justify-end max-w-lg space-y-4">
            <Quote className="text-emerald-400 size-8 opacity-80" aria-hidden="true" />
            <blockquote className="space-y-3">
              <p className="text-base font-bold leading-relaxed text-white font-sans text-pretty">
                &ldquo;{t("quote")}&rdquo;
              </p>
              <footer className="flex items-center gap-3 pt-1">
                <div className="size-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs font-sans">
                  BW
                </div>
                <div>
                  <div className="font-bold text-white text-sm font-sans">{t("quoteAuthor")}</div>
                  <div className="text-xs text-zinc-400 font-sans">{t("quoteRole")}</div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}