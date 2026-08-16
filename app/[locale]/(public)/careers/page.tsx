import { Metadata } from "next";
import CareersContent from "@/components/careers/CareersContent";

export const metadata: Metadata = {
  title: "Karir | CourtGrid - Bergabung Bersama Kami",
  description: "Bangun masa depan ekosistem dan fasilitas olahraga modern di Indonesia bersama CourtGrid.",
};

export default function CareersPage() {
  return <CareersContent />;
}
