"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import PageTransition from "@/components/motion/PageTransition";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-950 selection:bg-zinc-950 selection:text-white">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/20 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {isDesktopOpen && (
        <AdminSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminTopbar
          onMenuClick={() => setIsMobileOpen(true)}
          isSidebarOpen={isDesktopOpen}
          onToggleSidebar={() => setIsDesktopOpen((prev) => !prev)}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-50">
          <div className="max-w-7xl mx-auto space-y-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
