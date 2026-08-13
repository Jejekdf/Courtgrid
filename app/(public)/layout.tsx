import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/motion/PageTransition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="grow flex flex-col pt-24">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
