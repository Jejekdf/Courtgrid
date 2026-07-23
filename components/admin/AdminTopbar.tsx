"use client";

import { Menu, Search, Bell } from "lucide-react";
import { useSession } from "next-auth/react";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { data: session } = useSession();

  // Extract name for display and initial
  const userName = session?.user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="hidden sm:flex items-center relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input
            type="text"
            placeholder="Cari reservasi, pelanggan..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button className="relative p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block" />

        <button className="flex items-center gap-2.5 p-1 pr-2 hover:bg-zinc-50 rounded-full transition-colors border border-transparent hover:border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitial}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold text-zinc-950 leading-none truncate max-w-[120px]">
              {userName}
            </span>
            <span className="text-xs text-zinc-500 mt-1 leading-none">
              Admin
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
