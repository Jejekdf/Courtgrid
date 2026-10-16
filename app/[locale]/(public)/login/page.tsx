"use client";

import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { Link } from "@/i18n/navigation";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-10 xl:py-14 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-background text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-5xl xl:max-w-330 2xl:max-w-370 bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel: Auth Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-10 md:px-12 py-8 sm:py-10 xl:p-14 2xl:p-16 relative">
          <div className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl mx-auto space-y-6 xl:space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("title")}
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed text-pretty">
                {t("desc")}
              </p>
            </div>

            {/* Login Form wrapped in Suspense */}
            <div>
              <Suspense fallback={<div className="text-sm text-zinc-400">{t("formLoading")}</div>}>
                <LoginForm />
              </Suspense>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-zinc-600 pt-2">
              {t("noAccount")}{" "}
              <Link
                href="/register"
                className="font-bold text-zinc-950 underline underline-offset-4 hover:text-zinc-700 transition-colors"
              >
                {t("registerLink")}
              </Link>
            </p>
          </div>
        </div>

        {/* Right Panel: Visual Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-5/12 bg-zinc-950 relative overflow-hidden flex-col justify-between p-8 xl:p-12 2xl:p-14 border-l border-zinc-900 min-h-120 xl:min-h-140">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-[url('/futsal2.webp')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-700 hover-fine:scale-105" />
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
                  AT
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