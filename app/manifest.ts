import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CourtGrid Sport Center",
    short_name: "CourtGrid",
    description: "Platform booking venue olahraga terpercaya dengan sistem Anti-Palkor.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
