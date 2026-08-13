import type { Metadata } from "next";
import { Be_Vietnam_Pro, Albert_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const heading = Be_Vietnam_Pro({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const body = Albert_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CourtGrid - Premium Sports Reservation",
  description: "Platform booking venue olahraga terpercaya dengan sistem Anti-Palkor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${heading.variable} ${body.variable} ${mono.variable} h-full antialiased scroll-smooth`}
    >
      {/* Latar belakang dan teks diatur oleh globals.css (Light Mode) */}
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
