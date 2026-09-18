import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CourtGrid Sport Center",
    short_name: "CourtGrid",
    description: "Sewa lapangan futsal dan badminton di Jakarta dengan kepastian jadwal langsung dan pembayaran DP otomatis.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    categories: ["sports", "lifestyle"],
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Sewa Lapangan",
        url: "/courts",
        description: "Lihat daftar dan ketersediaan lapangan",
      },
      {
        name: "Jadwal Saya",
        url: "/dashboard/reservations",
        description: "Lihat tiket dan jadwal reservasi",
      },
    ],
  };
}

