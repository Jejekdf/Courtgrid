"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, MapPin, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Courts Management", href: "/admin/courts", icon: MapPin },
  ];

  return (
    <div className="w-64 bg-zinc-950 text-white min-h-screen md:flex flex-col p-4 space-y-8 hidden shrink-0">
      <div className="flex items-center space-x-2 px-2 mt-4">
        <div className="h-8 w-8 relative flex items-center justify-center bg-white rounded-md p-1">
          <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
        </div>
        <span className="text-sm font-semibold tracking-tight uppercase">
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-zinc-800 space-y-2">
        <Link
          href="/"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <span>&larr; Lihat Website Utama</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-400" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );
}
