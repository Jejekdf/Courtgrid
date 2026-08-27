"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const mobileNavItems = [
  { href: "/dashboard", label: "dashboard" },
  { href: "/dashboard/reservations", label: "history" },
  { href: "/dashboard/book", label: "book" },
  { href: "/dashboard/settings", label: "settings" },
] as const;

export function UserMobileDrawer() {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger
        className="md:hidden flex items-center justify-center size-11 -ml-3 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        aria-label={t("openMenu")}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">{t("sheetTitle")}</SheetTitle>
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 bg-zinc-50/50">
          <Link
            href="/dashboard"
            className="font-bold text-base text-zinc-950 flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="CourtGrid"
              width={24}
              height={24}
              priority
              className="rounded-md object-contain"
            />
            <span>CourtGrid</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSheetOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 min-h-11 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-950 text-white font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                )}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-4 bg-white">
          <button
            onClick={() => {
              setSheetOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 min-h-11 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
