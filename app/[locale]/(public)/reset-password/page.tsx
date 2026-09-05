"use client";

import { Link } from "@/i18n/navigation";
import { Quote } from "lucide-react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.reset");

  return (
    <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[var(--background)] text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-5xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col lg:flex-row-reverse">
        {/* Right Panel: Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-10 md:px-12 py-8 sm:py-10 relative">
          <div className="w-full max-w-md mx-auto space-y-6">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              &larr; {t("backToLogin")}
            </Link>

            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 text-balance">
                {t("title")}
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed text-pretty">
                {t("desc")}
              </p>
            </div>

            {/* Form */}
            <div>
              <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-zinc-500">{t("loadingForm")}</div>}>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Left Panel: Visual Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-5/12 bg-zinc-950 relative overflow-hidden flex-col justify-between p-8 xl:p-10 border-r border-zinc-900 min-h-[480px]">
          <div className="absolute inset-0 bg-[url('/badminton1.webp')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-1000 hover-fine:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-transparent to-transparent opacity-80" />
          
          <div className="relative z-10 flex flex-col justify-end h-full max-w-xl space-y-4">
            <Quote className="text-emerald-500 size-8 opacity-80" />
            <blockquote className="space-y-3">
              <p className="text-base font-bold leading-relaxed text-white font-sans text-pretty">
                &ldquo;{t("quote")}&rdquo;
              </p>
              <footer className="flex items-center gap-3 pt-1">
                <div className="size-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs">
                  CG
                </div>
                <div>
                  <div className="font-semibold text-white">{t("quoteAuthor")}</div>
                  <div className="text-sm text-zinc-300">{t("quoteRole")}</div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}