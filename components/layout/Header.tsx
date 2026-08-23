"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const t = useTranslations("header");

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Scroll spy to detect active section on landing page
  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      const courtsSection = document.getElementById("courts");
      const aboutSection = document.getElementById("about");
      const scrollY = window.scrollY;
      
      let newActive = "";
      if (aboutSection && scrollY >= (aboutSection.offsetTop - 150)) {
        newActive = "#about";
      } else if (courtsSection && scrollY >= (courtsSection.offsetTop - 150)) {
        newActive = "#courts";
      }
      
      setActiveSection(newActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const checkIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && activeSection === "";
    }
    
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      return pathname === "/" && activeSection === hash;
    }

    return pathname === href;
  };

  const logoElement = (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0 outline-none">
      <Image src="/logo.svg" alt="CourtGrid Logo" width={28} height={28} priority className="rounded-lg object-contain transition-transform group-hover-fine:scale-95" />
      <span className="font-heading text-zinc-950 font-extrabold tracking-tight text-base sm:text-lg">
        CourtGrid
      </span>
    </Link>
  );

  const navLinksData = [
    { label: t("navBeranda"), href: "/" },
    { label: t("navFasilitas"), href: "/#courts" },
    { label: t("navKatalog"), href: "/courts" },
    { label: t("navTentang"), href: "/#about" },
  ];

  const isLoggedIn = status === "authenticated" && session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const dashboardText = isAdmin ? t("adminPanel") : t("dashboard");
  const userImage = session?.user?.image || null;
  const userName = session?.user?.name || "";

  const loadingButtonsElement = (
    <div className="flex items-center gap-2" aria-hidden>
      <span className="h-9 w-16 rounded-lg bg-zinc-100 animate-pulse" />
      <span className="h-9 w-16 rounded-lg bg-zinc-200 animate-pulse" />
    </div>
  );

  const userButtonsElement =
    status === "loading" ? (
      loadingButtonsElement
    ) : isLoggedIn ? (
    <Link
      href={dashboardHref}
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors shadow-xs outline-none w-full sm:w-auto cursor-pointer min-h-11"
    >
      {userImage ? (
        <Image src={userImage} alt={userName} width={16} height={16} className="size-4 rounded-full object-cover" />
      ) : (
        <LayoutDashboard className="size-4 text-emerald-400" />
      )}
      <span>{dashboardText}</span>
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="flex items-center justify-center px-4 py-2 text-sm font-semibold border border-zinc-200 bg-zinc-50 text-zinc-950 rounded-lg hover:bg-zinc-100 transition-colors duration-200 w-full sm:w-auto text-center outline-none cursor-pointer min-h-11"
      >
        {t("masuk")}
      </Link>
      <Link
        href="/register"
        className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-colors duration-200 w-full sm:w-auto outline-none cursor-pointer shadow-xs min-h-11"
      >
        {t("daftar")}
      </Link>
    </>
  );

  return (
    <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-0 right-0 z-50 flex justify-center px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pointer-events-none">
      <header
        className={`pointer-events-auto
          flex flex-col items-center
          px-5 py-3 backdrop-blur-md
          rounded-xl
          border border-zinc-200/80 bg-white/90 shadow-xs
          w-full max-w-7xl`}
      >
        <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
          <div className="flex items-center">{logoElement}</div>

          <nav className="hidden sm:flex items-center space-x-6">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium outline-none transition-colors py-1.5
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-zinc-950 after:origin-left after:transition-transform after:duration-200 after:ease-out
                  ${
                    checkIsActive(link.href)
                      ? "text-zinc-950 font-semibold after:scale-x-100"
                      : "text-zinc-600 hover:text-zinc-950 after:scale-x-0 hover:after:scale-x-100"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            {userButtonsElement}
          </div>

          <button
            type="button"
            className="sm:hidden flex items-center justify-center size-11 text-zinc-700 hover:text-zinc-950 focus:outline-none transition-colors outline-none cursor-pointer"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? t("closeMenu") : t("openMenu")}
          >
            {isOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>

        <div
          id="mobile-navigation"
          className={`sm:hidden flex flex-col items-center w-full transition-[max-height,opacity] ease-out duration-200 overflow-hidden
            ${isOpen ? "max-h-250 opacity-100 pt-5 pb-2" : "max-h-0 opacity-0 pt-0 pointer-events-none"}`}
        >
          <nav onClick={closeMenu} className="flex flex-col items-center space-y-1 w-full">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium w-full justify-center text-center min-h-11 flex items-center transition-colors outline-none rounded-lg px-4
                  ${
                    checkIsActive(link.href)
                      ? "bg-zinc-100 text-zinc-950 font-bold"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div onClick={closeMenu} className="flex flex-col items-center space-y-2 mt-4 w-full">
            {userButtonsElement}
          </div>
        </div>
      </header>
    </div>
  );
}