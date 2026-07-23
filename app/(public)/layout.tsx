import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="grow flex flex-col pt-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
