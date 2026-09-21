"use client";

import { Menu, PanelLeftClose, PanelLeft, QrCode, Globe } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useQueryState } from "nuqs";
import { adminScannerParser } from "@/lib/search-params";

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
  const [, setIsScannerOpen] = useQueryState("scanner", adminScannerParser.withOptions({ shallow: true }));
  const openScanner = () => setIsScannerOpen(true);
  const t = useTranslations("admin.topbar");

  const userName = session?.user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 min-h-10 min-w-10 -ml-1 flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          aria-label={t("openSidebar")}
        >
          <Menu className="size-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 min-h-10 min-w-10 items-center justify-center text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? t("closeSidebar") : t("openSidebar")}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-5" />
            ) : (
              <PanelLeft className="size-5" />
            )}
          </button>
        )}
      </div>

      {/* Action + Admin User Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/courts"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("viewSite")}
          className="flex items-center gap-1.5 px-3 py-2 min-h-10 text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors border border-transparent hover:border-zinc-200 cursor-pointer"
        >
          <Globe className="size-4" />
          <span className="hidden sm:inline">{t("viewSite")}</span>
        </Link>
        <button
          type="button"
          onClick={openScanner}
          aria-label={t("verifyTicket")}
          className="flex items-center gap-2 px-3.5 py-2 min-h-10 text-xs sm:text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl transition-colors border border-zinc-200/80 cursor-pointer shadow-2xs"
        >
          <QrCode className="size-4 text-emerald-600" />
          <span className="hidden lg:inline">{t("verifyTicket")}</span>
        </button>
        <div className="flex items-center gap-2.5 p-1 sm:p-1.5 sm:pr-3 hover:bg-zinc-100 rounded-xl transition-colors border border-transparent hover:border-zinc-200">
          <div className="size-8 sm:size-9 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
            {userInitial}
          </div>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-bold text-zinc-950 leading-tight truncate max-w-36">
              {userName}
            </span>
            <span className="text-[0.6875rem] text-zinc-400 leading-none font-mono mt-0.5">
              {t("superadminRole")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

