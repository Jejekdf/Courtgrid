import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Be_Vietnam_Pro, Albert_Sans, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const heading = Be_Vietnam_Pro({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const body = Albert_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const BASE_URL = "https://courtgrid-one.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ogLocale = locale === "id" ? "id_ID" : "en_US";

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "CourtGrid - Premium Sports Reservation",
      template: "%s | CourtGrid",
    },
    description:
      "Platform booking venue olahraga terpercaya dengan sistem Anti-Palkor.",
    openGraph: {
      title: "CourtGrid - Premium Sports Reservation",
      description:
        "Platform booking venue olahraga terpercaya dengan sistem Anti-Palkor.",
      url: BASE_URL,
      siteName: "CourtGrid",
      locale: ogLocale,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CourtGrid - Premium Sports Reservation",
      description:
        "Platform booking venue olahraga terpercaya dengan sistem Anti-Palkor.",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: BASE_URL,
      languages: {
        id: `${BASE_URL}/id`,
        en: `${BASE_URL}/en`,
        "x-default": BASE_URL,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${heading.variable} ${body.variable} ${mono.variable} h-full antialiased scroll-smooth`}
    >
      {/* Background and text are controlled by globals.css (Light Mode) */}
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}