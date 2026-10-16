"use client";

import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";
import { Link } from "@/i18n/navigation";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  return (
    <div className="w-full flex-1 flex items-center justify-center py-2 sm:py-4 lg:py-4 xl:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-background text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-5xl xl:max-w-330 2xl:max-w-370 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col lg:flex-row-reverse">
        {/* Right Panel: Auth Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-10 md:px-12 py-4 sm:py-5 lg:py-6 xl:p-12 2xl:p-14 relative">
          <div className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl mx-auto space-y-3.5 xl:space-y-5">
            {/* Header */}
            <div className="flex flex-col space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("title")}
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed text-pretty">
                {t("desc")}
              </p>
            </div>

            {/* Register Form wrapped in Suspense */}
            <div>
              <Suspense fallback={<div className="text-sm text-zinc-400">{t("formLoading")}</div>}>
                <RegisterForm />
              </Suspense>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-zinc-600 pt-1">
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
        <div className="hidden lg:flex lg:w-5/12 bg-zinc-950 relative overflow-hidden flex-col justify-between p-8 xl:p-12 2xl:p-14 border-r border-zinc-900 min-h-120 xl:min-h-140">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-[url('/badminton_court_pro.webp')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-700 hover-fine:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          

          {/* Testimonial Quote Content */}
          <div className="relative z-10 flex flex-col justify-end max-w-lg space-y-4">
            <Quote className="text-emerald-400 size-8 opacity-80" aria-hidden="true" />
            <blockquote className="space-y-3">
              <p className="text-base xl:text-lg font-bold leading-relaxed text-white font-sans text-pretty">
                &ldquo;{t("quote")}&rdquo;
              </p>
              <footer className="flex items-center gap-3 pt-1">
                <div className="size-8.5 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs font-sans">
                  BW
                </div>
                <div>
                  <div className="font-bold text-white text-sm sm:text-base font-sans">{t("quoteAuthor")}</div>
                  <div className="text-xs sm:text-sm text-zinc-400 font-sans">{t("quoteRole")}</div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}