"use client";

import { useState } from "react";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { UserTopbar } from "@/components/dashboard/UserTopbar";
import PageTransition from "@/components/motion/PageTransition";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50/50">
      <UserSidebar isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UserTopbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
