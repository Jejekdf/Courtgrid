"use client";

import { useState, useRef } from "react";
import { useDebounce, useClickAway } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { Menu, PanelLeftClose, PanelLeft, Search, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { courtKeys } from "@/lib/query-keys";
import NotificationCenter, { type NotificationItem } from "@/components/ui/NotificationCenter";
import { getCourts } from "@/features/courts/actions";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/reservations", label: "Riwayat Booking" },
  { href: "/dashboard/book", label: "Pesan Lapangan" },
  { href: "/dashboard/settings", label: "Pengaturan Profil" },
];

interface UserTopbarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function UserTopbar({ isSidebarOpen = true, onToggleSidebar }: UserTopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Global Search State for Customer
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mobile Sheet State
  const [sheetOpen, setSheetOpen] = useState(false);

  // Debounce search input (react-use functional form, same as CourtCatalog).
  useDebounce(
    () => {
      setDebouncedQuery(searchTerm);
    },
    300,
    [searchTerm]
  );

  const { data: courts = [] } = useQuery({
    queryKey: courtKeys.list({}),
    queryFn: () => getCourts(),
  });

  const searchResults = debouncedQuery.trim()
    ? courts.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  // Notification State
  const [notifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Pemesanan Lapangan",
      message: "Cek jadwal main terbaru dan E-Ticket QR Anda.",
      time: new Date().toISOString(),
      link: "/dashboard/reservations",
    },
  ]);

  const userName = session?.user?.name || "Pelanggan";
  const userImage = session?.user?.image || null;
  const userInitial = userName.charAt(0).toUpperCase();

  // Close search dropdown on outside click (react-use useClickAway, ['mousedown'] keeps prior behavior).
  useClickAway(searchRef, () => setIsSearchOpen(false), ["mousedown"]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Drawer Trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger 
            className="md:hidden flex items-center justify-center w-11 h-11 -ml-3 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigasi Pelanggan</SheetTitle>
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 bg-zinc-50/50">
              <Link href="/dashboard" className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <Image src="/icon.ico" alt="CourtGrid" width={24} height={24} priority className="rounded-md object-contain" />
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-950 text-white font-semibold"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-4 bg-white">
              <button
                onClick={() => { setSheetOpen(false); handleLogout(); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Keluar Sistem
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Active Debounced Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Cari arena futsal & badminton..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
          />

          {/* Search Results Dropdown */}
{isSearchOpen && debouncedQuery.trim().length > 0 && (
            <div className="absolute right-0 left-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 space-y-2 z-50 text-sm max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((c) => (
                  <Link
                    key={c.id}
                    href="/dashboard/book"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                  >
                    <div>
                      <div className="font-bold text-zinc-950">{c.name}</div>
                      <div className="text-xs text-zinc-400 font-mono">{c.type}</div>
                    </div>
                    <span className="font-bold text-zinc-900">Rp {c.pricePerHour.toLocaleString("id-ID")}/jam</span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-zinc-400">Tidak ada lapangan yang cocok.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Actions & Notification Center */}
      <div className="flex items-center gap-3">
        <NotificationCenter notifications={notifications} />

        <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

        <Link href="/dashboard/settings">
          <div className="flex items-center gap-2.5 p-1 pr-2 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInitial}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-zinc-950 leading-none truncate max-w-28">
                {userName}
              </span>
              <span className="text-xs text-zinc-400 mt-0.5 leading-none font-mono">
                Pelanggan
              </span>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default UserTopbar;