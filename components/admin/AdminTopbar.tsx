"use client";

import { useState, useRef } from "react";
import { useDebounce, useClickAway } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { Menu, PanelLeftClose, PanelLeft, Search, Bell, Calendar, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { adminGlobalSearch, adminGetNotifications } from "@/features/admin/actions";
import { adminKeys } from "@/lib/query-keys";
import Link from "next/link";

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
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Debounce search input (react-use functional form, same as CourtCatalog).
  useDebounce(
    () => {
      setDebouncedQuery(searchTerm);
    },
    300,
    [searchTerm]
  );

  const searchQuery = useQuery({
    queryKey: adminKeys.search(debouncedQuery),
    queryFn: () => adminGlobalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    select: (res) => (res.success ? res : null),
  });
  const searchResults = searchQuery.data;
  const isSearching = searchQuery.isFetching;

  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  const { data: notifData = [] } = useQuery({
    queryKey: adminKeys.notifications(),
    queryFn: adminGetNotifications,
    select: (res) => (res.success ? res.notifications : []),
  });
  const notifications = notifData;

  // Close dropdowns on outside click (react-use useClickAway, ['mousedown'] keeps prior behavior).
  useClickAway(searchRef, () => setIsSearchOpen(false), ["mousedown"]);
  useClickAway(notifRef, () => setIsNotifOpen(false), ["mousedown"]);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
            title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Active Global Search Bar */}
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
            placeholder="Cari ID reservasi, pelanggan, arena..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
          />

          {/* Search Dropdown Results */}
          {isSearchOpen && (searchTerm.trim().length > 0) && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 space-y-3 z-50 text-sm max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-4 text-zinc-400 font-mono">Mencari di database...</div>
              ) : searchResults && (searchResults.reservations.length > 0 || searchResults.courts.length > 0) ? (
                <>
                  {searchResults.reservations.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono font-bold uppercase text-zinc-400 px-1">Reservasi</div>
                      {searchResults.reservations.map((r) => (
                        <Link
                          key={r.id}
                          href="/admin/reservations"
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                        >
                          <div>
                            <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span>{r.user?.name || "Pelanggan"}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono">{r.court?.name} • ID: {r.id.slice(0, 8)}</div>
                          </div>
                          <span className="font-semibold text-zinc-900">Rp {r.totalPrice.toLocaleString("id-ID")}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.courts.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                      <div className="text-[11px] font-mono font-bold uppercase text-zinc-400 px-1">Lapangan</div>
                      {searchResults.courts.map((c) => (
                        <Link
                          key={c.id}
                          href="/admin/courts"
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                        >
                          <div>
                            <div className="font-bold text-zinc-950">{c.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{c.type}</div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {c.isActive ? "AKTIF" : "NONAKTIF"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-zinc-400">Tidak ada data yang cocok.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Functional Notification Center */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors relative cursor-pointer"
            title="Notifikasi Masuk"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-50 text-sm space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="font-bold text-zinc-950">Notifikasi System</span>
                <span className="text-[11px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-semibold">
                  {notifications.length} PENDING
                </span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400">Tidak ada notifikasi baru.</div>
                ) : (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-2.5 hover:bg-zinc-50 rounded-lg border border-zinc-100 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-zinc-950">{notif.title}</div>
                          <div className="text-sm text-zinc-600 mt-0.5">{notif.message}</div>
                          <div className="text-[11px] text-zinc-400 font-mono mt-1">
                            {new Date(notif.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

        <div className="flex items-center gap-2.5 p-1 pr-2 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
          <div className="w-7 h-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {userInitial}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold text-zinc-950 leading-none truncate max-w-28">
              {userName}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 leading-none font-mono">
              Superadmin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
