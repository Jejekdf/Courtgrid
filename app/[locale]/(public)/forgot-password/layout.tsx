import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi | CourtGrid",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
