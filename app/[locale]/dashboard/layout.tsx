import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";

// Dashboard is user-authenticated — exclude from search engine indexing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

