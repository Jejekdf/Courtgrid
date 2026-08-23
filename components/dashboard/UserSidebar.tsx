"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarCheck, Settings, LogOut, CalendarPlus } from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarItems = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "history", icon: CalendarCheck },
  { href: "/dashboard/book", label: "book", icon: CalendarPlus },
  { href: "/dashboard/settings", label: "settings", icon: Settings },
] as const;

interface UserSidebarProps {
  isSidebarOpen?: boolean;
}

export function UserSidebar({ isSidebarOpen = true }: UserSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex h-full flex-col bg-white border-r border-zinc-200 shadow-xs shrink-0 transition-[width,opacity] duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none opacity-0"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 shrink-0 bg-zinc-50/50">
        <Link href="/dashboard" className="font-bold text-base text-zinc-950 tracking-tight flex items-center gap-2">
          <Image src="/logo.svg" alt="CourtGrid Logo" width={24} height={24} priority className="rounded-md object-contain" />
          <span>CourtGrid</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
        <nav className="space-y-1">
          <div className="px-3 mb-2 text-[0.6875rem] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            MENU
          </div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-zinc-950 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-zinc-500")} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Logout Area */}
        <div className="border-t border-zinc-100 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default UserSidebar;
