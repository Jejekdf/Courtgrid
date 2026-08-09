"use client";

import { Menu, Bell, LayoutDashboard, Calendar, Settings, LogOut, CalendarPlus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Riwayat Booking", icon: Calendar },
  { href: "/dashboard/book", label: "Pesan Lapangan", icon: CalendarPlus },
  { href: "/dashboard/settings", label: "Profil & Keamanan", icon: Settings },
];

export function UserTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Customer";
  const userImage = session?.user?.image || null;
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30 transition-all duration-300">
      {/* Mobile Drawer & Title */}
      <div className="flex items-center gap-4 flex-1">
        <Sheet>
          <SheetTrigger 
            className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 bg-zinc-50/50">
              <Link href="/dashboard" className="font-bold text-lg text-zinc-950 flex items-center gap-2">
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
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-950 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-4 bg-white">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-sm font-semibold md:text-base text-zinc-950 hidden sm:block">Customer Portal</h1>
      </div>

      {/* Notifications & Profile / Logout Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/dashboard/reservations">
          <button
            className="relative p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors"
            title="Notifikasi Booking"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>
        </Link>

        <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings">
            <button className="flex items-center gap-2.5 p-1 pr-2 hover:bg-zinc-100 rounded-full transition-colors border border-transparent hover:border-zinc-200">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {userInitial}
                </div>
              )}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-zinc-950 leading-none truncate max-w-30">
                  {userName}
                </span>
                <span className="text-xs text-zinc-500 mt-1 leading-none">
                  Member
                </span>
              </div>
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors ml-1"
            title="Log out dari akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default UserTopbar;