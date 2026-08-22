import type { MetadataRoute } from "next";

const BASE_URL = "https://courtgrid-one.vercel.app";

// Public pages that should be indexed by search engines.
// Dashboard, admin, auth, and API routes are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["id", "en"] as const;

  const pages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/courts", changeFrequency: "weekly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  return entries;
}
