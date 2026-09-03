import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV === "development";
const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev", "localhost", "*.localhost"],
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: {
      // Upload actions carry raw image files up to the 5MB app-level cap;
      // form encoding inflates the payload past 1MB default.
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src ${scriptSrc} https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'`,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  images: {
    qualities: [75, 80],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
    ],
    // Dev boxes on NAT64/DNS64 (64:ff9b::/96) resolve public hosts to
    // synthetic IPv6 addresses that the SSRF guard treats as private,
    // which 400s every remote image. Production DNS is unaffected.
    dangerouslyAllowLocalIP: isDev,
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
