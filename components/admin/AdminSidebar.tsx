"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Hexagon, LayoutDashboard, CalendarDays, Box, Settings, LogOut, X } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
    { href: "/admin/courts", label: "Courts", icon: Box },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 group outline-none [-webkit-tap-highlight-color:transparent]">
          <div className="relative w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-[0.98]">
            <Hexagon className="absolute inset-0 w-full h-full text-white fill-white/10 stroke-[1.5]" />
            <img src="/favicon.ico" alt="CourtGrid Logo" className="absolute w-4 h-4 object-contain brightness-0 invert" />
          </div>
          <span className="font-bold tracking-tight text-lg">CourtGrid Admin</span>
        </Link>
        <button className="md:hidden text-zinc-400 hover:text-white" onClick={onClose} aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Menu
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : ""}`} />
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
