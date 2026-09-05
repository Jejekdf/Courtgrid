"use client";

import { Link } from "@/i18n/navigation";
import { Quote } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");

  return (
    <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[var(--background)] text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-5xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel: Form */}
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
              <ForgotPasswordForm />
            </div>
          </div>
        </div>

        {/* Right Panel: Visual Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-5/12 bg-zinc-950 relative overflow-hidden flex-col justify-between p-8 xl:p-10 border-l border-zinc-900 min-h-[480px]">
          <div className="absolute inset-0 bg-[url('/futsal1.webp')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-1000 hover-fine:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-transparent to-transparent opacity-80" />
          
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