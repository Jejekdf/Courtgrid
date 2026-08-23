"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, Box, Settings, LogOut, X } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const links = [
    { href: "/admin", label: "overview", icon: LayoutDashboard },
    { href: "/admin/reservations", label: "reservations", icon: CalendarDays },
    { href: "/admin/courts", label: "courts", icon: Box },
    { href: "/admin/settings", label: "settings", icon: Settings },
  ] as const;

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-white transform transition-transform duration-200 ease-out flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 outline-none">
          <Image src="/logo.svg" alt="CourtGrid Logo" width={24} height={24} priority className="rounded-md object-contain" />
          <span className="font-bold tracking-tight text-base">CourtGrid Admin</span>
        </Link>
        <button className="md:hidden text-zinc-400 hover:text-white" onClick={onClose} aria-label={t("closeMenu")}>
          <X className="size-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[0.6875rem] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
          {t("sectionLabel")}
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-300 hover:bg-zinc-900/50 hover:text-white"
              }`}
            >
              <Icon className={`size-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
              <span>{t(link.label)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-zinc-900 shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
