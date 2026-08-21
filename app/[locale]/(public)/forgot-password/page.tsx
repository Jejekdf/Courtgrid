"use client";

import { Link } from "@/i18n/navigation";
import { Quote } from "lucide-react";
import Image from "next/image";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");

  return (
    <main className="min-h-screen w-full flex bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <Link 
          href="/login" 
          className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-2"
        >
          &larr; {t("backToLogin")}
        </Link>

        <div className="w-full max-w-md mx-auto space-y-8 mt-12 mb-12">
          {/* Header Branding */}
          <div className="flex flex-col space-y-3">
            <Link href="/" className="flex items-center gap-2.5 mb-2 group w-max outline-none [-webkit-tap-highlight-color:transparent]">
              <Image src="/icon.ico" alt="CourtGrid Logo" width={32} height={32} className="w-8 h-8 rounded-lg object-contain transition-transform group-hover-fine:scale-95" />
              <span className="text-xl font-bold tracking-tight text-zinc-950">CourtGrid</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              {t("title")}
            </h1>
            <p className="text-sm text-zinc-500 font-normal leading-relaxed">
              {t("desc")}
            </p>
          </div>

          {/* Form */}
          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      {/* Right Panel: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 lg:p-24 border-l border-zinc-800">
        <div className="absolute inset-0 bg-[url('/futsal1.webp')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-1000 hover-fine:scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-end h-full max-w-xl">
          <Quote className="text-emerald-500 w-12 h-12 mb-6 opacity-80" />
          <blockquote className="space-y-6">
            <p className="text-2xl lg:text-3xl font-medium leading-tight text-white">
              &ldquo;{t("quote")}&rdquo;
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white font-bold text-lg">
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
    </main>
  );
}