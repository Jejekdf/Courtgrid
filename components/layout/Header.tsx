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

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (pathname === "/") {
      if (href === "/") {
        e?.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.location.hash) {
          window.history.pushState(null, "", window.location.pathname);
        }
        setActiveSection("");
      } else if (href === "/#courts") {
        e?.preventDefault();
        const el = document.getElementById("courts");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `${window.location.pathname}#courts`);
          setActiveSection("#courts");
        }
      }
    }
  };

  const logoElement = (
    <Link href="/" onClick={(e) => handleNavClick("/", e)} className="flex items-center gap-2.5 group shrink-0 outline-hidden">
      <Image src="/logo.svg" alt="CourtGrid Logo" width={32} height={32} priority className="size-7 sm:size-8 rounded-lg object-contain transition-transform group-hover-fine:scale-95" />
      <span className="font-heading text-zinc-950 font-extrabold tracking-tight text-base sm:text-lg lg:text-xl">
        CourtGrid
      </span>
    </Link>
  );

  const navLinksData = [
    { label: t("navBeranda"), href: "/" },
    { label: t("navFasilitas"), href: "/#courts" },
    { label: t("navKatalog"), href: "/courts" },
    { label: t("navTentang"), href: "/about" },
  ];

  const isLoggedIn = status === "authenticated" && session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const dashboardText = isAdmin ? t("adminPanel") : t("dashboard");
  const userImage = session?.user?.image || null;
  const userName = session?.user?.name || "";

  const loadingButtonsElement = (
    <div className="flex items-center gap-2" aria-hidden>
      <span className="h-10 w-16 rounded-xl bg-zinc-100 animate-pulse" />
      <span className="h-10 w-16 rounded-xl bg-zinc-200 animate-pulse" />
    </div>
  );

  const userButtonsElement =
    status === "loading" ? (
      loadingButtonsElement
    ) : isLoggedIn ? (
    <Link
      href={dashboardHref}
      className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-sm lg:text-base font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl transition-colors shadow-xs outline-hidden w-full sm:w-auto cursor-pointer min-h-11 sm:min-h-12"
    >
      {userImage ? (
        <Image src={userImage} alt={userName} width={18} height={18} className="size-4.5 rounded-full object-cover" />
      ) : (
        <LayoutDashboard className="size-4.5 text-emerald-400" />
      )}
      <span>{dashboardText}</span>
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm lg:text-base font-bold border border-zinc-200 bg-zinc-50 text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors duration-200 w-full sm:w-auto text-center outline-hidden cursor-pointer min-h-11 sm:min-h-12"
      >
        {t("masuk")}
      </Link>
      <Link
        href="/register"
        className="flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm lg:text-base font-bold text-white bg-zinc-950 rounded-xl hover:bg-zinc-800 transition-colors duration-200 w-full sm:w-auto outline-hidden cursor-pointer shadow-xs min-h-11 sm:min-h-12"
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
          px-5 py-3 sm:px-6 sm:py-3.5 backdrop-blur-md
          rounded-2xl
          border border-zinc-200/80 bg-white/90 shadow-xs
          w-full max-w-7xl`}
      >
        <div className="flex items-center justify-between w-full gap-x-6">
          <div className="flex items-center">{logoElement}</div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className={`relative text-sm lg:text-base font-semibold outline-hidden transition-colors py-1.5
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

          <div className="hidden md:flex items-center gap-2">
            {userButtonsElement}
          </div>

          <button
            type="button"
            className="md:hidden flex items-center justify-center size-11 text-zinc-700 hover:text-zinc-950 focus:outline-hidden transition-colors outline-hidden cursor-pointer"
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
          className={`md:hidden flex flex-col items-center w-full transition-[max-height,opacity] ease-out duration-200 overflow-hidden
            ${isOpen ? "max-h-250 opacity-100 pt-4 pb-2" : "max-h-0 opacity-0 pt-0 pointer-events-none"}`}
        >
          <nav onClick={closeMenu} className="flex flex-col items-center space-y-1 w-full">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className={`relative text-sm font-medium w-full justify-center text-center min-h-11 flex items-center transition-colors outline-hidden rounded-lg px-4
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
          <div onClick={closeMenu} className="flex flex-col items-center space-y-2 mt-3 w-full">
            {userButtonsElement}
          </div>
        </div>
      </header>
    </div>
  );
}