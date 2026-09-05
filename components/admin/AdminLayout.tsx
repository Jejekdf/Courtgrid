"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import PageTransition from "@/components/motion/PageTransition";
import { TicketVerificationDialog } from "@/components/admin/reservations/TicketVerificationDialog";
import { useBoundStore, useAdminReservationsActions } from "@/stores/useBoundStore";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const isScannerOpen = useBoundStore((state) => state.adminReservations.scanner.isOpen);
  const { openScanner, closeScanner } = useAdminReservationsActions();
  const queryClient = useQueryClient();

  return (
    <div className="min-h-dvh bg-zinc-50 flex font-sans text-zinc-950 selection:bg-zinc-950 selection:text-white">
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
      
      <div className="flex-1 flex flex-col min-w-0 h-svh overflow-hidden">
        <AdminTopbar
          onMenuClick={() => setIsMobileOpen(true)}
          isSidebarOpen={isDesktopOpen}
          onToggleSidebar={() => setIsDesktopOpen((prev) => !prev)}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-50">
          <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto space-y-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

      <TicketVerificationDialog
        isOpen={isScannerOpen}
        onOpenChange={(open) => {
          if (!open) closeScanner();
          else openScanner();
        }}
        onCheckInSuccess={() => queryClient.invalidateQueries({ queryKey: adminKeys.all })}
      />
    </div>
  );
}
