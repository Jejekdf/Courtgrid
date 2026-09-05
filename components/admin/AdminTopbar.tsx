"use client";

import { Menu, PanelLeftClose, PanelLeft, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useAdminReservationsActions } from "@/stores/useBoundStore";

interface AdminTopbarProps {
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function AdminTopbar({
  onMenuClick,
  isSidebarOpen = true,
  onToggleSidebar,
}: AdminTopbarProps) {
  const { data: session } = useSession();
  const { openScanner } = useAdminReservationsActions();
  const t = useTranslations("admin.topbar");

  const userName = session?.user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          aria-label={t("openSidebar")}
        >
          <Menu className="size-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? t("closeSidebar") : t("openSidebar")}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeft className="size-4" />
            )}
          </button>
        )}
      </div>

      {/* Action + Admin User Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg transition-colors border border-zinc-200 cursor-pointer"
        >
          <QrCode className="size-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Verifikasi Tiket</span>
        </button>
        <div className="flex items-center gap-2.5 p-1 pr-2 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
          <div className="size-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitial}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold text-zinc-950 leading-none truncate max-w-28">
              {userName}
            </span>
            <span className="text-xs text-zinc-400 mt-0.5 leading-none font-mono">
              {t("superadminRole")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

