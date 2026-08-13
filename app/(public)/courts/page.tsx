import { Suspense } from "react";
import type { Metadata } from "next";
import CourtCatalog from "@/components/courts/CourtCatalog";
import CourtState from "@/components/courts/CourtState";

export const metadata: Metadata = {
  title: "Katalog Lapangan - CourtGrid",
  description:
    "Jelajahi dan saring lapangan Futsal maupun Badminton yang tersedia di CourtGrid beserta harga per jam.",
};

export default function CourtsPage() {
  return (
    <Suspense fallback={<CourtState type="loading" />}>
      <CourtCatalog />
    </Suspense>
  );
}