"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = { id: "ID", en: "EN" };

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: (typeof routing.locales)[number]) => {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border p-0.5 ${
        isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      {routing.locales.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            onClick={() => switchLocale(l)}
            className={`px-2 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              active
                ? "bg-zinc-950 text-white"
                : isDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-500 hover:text-zinc-950"
            }`}
            aria-pressed={active}
          >
            {labels[l]}
          </button>
        );
      })}
    </div>
  );
}