"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import NotificationCenter, {
  type NotificationItem,
} from "@/components/ui/NotificationCenter";
import { UserMobileDrawer } from "./UserMobileDrawer";
import { UserQuickSearch } from "./UserQuickSearch";
import { UserAvatarBadge } from "./UserAvatarBadge";

interface UserTopbarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function UserTopbar({
  isSidebarOpen = true,
  onToggleSidebar,
}: UserTopbarProps) {
  const { data: session } = useSession();
  const tToggle = useTranslations("dashboard.topbar");
  const tHome = useTranslations("dashboard.home");

  // Notification State
  const [notifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: tHome("notifTitle"),
      message: tHome("notifMessage"),
      time: new Date().toISOString(),
      link: "/dashboard/reservations",
    },
  ]);

  const userName = session?.user?.name || "Pelanggan";
  const userImage = session?.user?.image || null;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Drawer Trigger */}
        <UserMobileDrawer />

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? tToggle("closeSidebar") : tToggle("openSidebar")}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeft className="size-4" />
            )}
          </button>
        )}

        {/* Active Debounced Search Bar */}
        <UserQuickSearch />
      </div>

      {/* User Actions & Notification Center */}
      <div className="flex items-center gap-3">
        <NotificationCenter notifications={notifications} />

        <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

        <UserAvatarBadge
          userName={userName}
          userImage={userImage}
          userInitial={userInitial}
        />
      </div>
    </header>
  );
}

export default UserTopbar;