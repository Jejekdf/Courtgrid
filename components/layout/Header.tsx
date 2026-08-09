"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const [activeSection, setActiveSection] = useState("");
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Scroll spy to detect active section on landing page
  useEffect(() => {
    if (pathname !== "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const courtsSection = document.getElementById("courts");
      const aboutSection = document.getElementById("about");

      if (!courtsSection || !aboutSection) return;

      const scrollY = window.scrollY;
      const courtsTop = courtsSection.offsetTop - 150;
      const aboutTop = aboutSection.offsetTop - 150;

      if (scrollY >= aboutTop) {
        setActiveSection("#about");
      } else if (scrollY >= courtsTop) {
        setActiveSection("#courts");
      } else {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Close menu on path change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  const checkIsActive = (href: string) => {
    if (pathname !== "/") return pathname === href;
    if (href === "/") return activeSection === "";
    return href === `/${activeSection}`;
  };

  const logoElement = (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0 outline-none [-webkit-tap-highlight-color:transparent]">
      <Image src="/icon.ico" alt="CourtGrid Logo" width={32} height={32} priority className="rounded-lg object-contain transition-transform group-hover:scale-95" />
      <span className="text-zinc-950 font-bold tracking-tight text-base sm:text-lg">
        CourtGrid
      </span>
    </Link>
  );

  const navLinksData = [
    { label: "Home", href: "/" },
    { label: "Courts", href: "/#courts" },
    { label: "Katalog", href: "/courts" },
    { label: "About", href: "/#about" },
  ];

  const isLoggedIn = status === "authenticated" && session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const dashboardText = isAdmin ? "Admin Panel" : "Dashboard Saya";
  const userImage = session?.user?.image || null;
  const userName = session?.user?.name || "";

  const userButtonsElement = isLoggedIn ? (
    <Link
      href={dashboardHref}
      className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-md transition-all shadow-xs outline-none w-full sm:w-auto"
    >
      {userImage ? (
        <img src={userImage} alt={userName} className="w-4 h-4 rounded-full object-cover" />
      ) : (
        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
      )}
      <span>{dashboardText}</span>
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-xs sm:text-sm font-medium border border-zinc-200 bg-white text-zinc-950 rounded-md hover:bg-zinc-50 transition-all duration-200 w-full sm:w-auto text-center outline-none"
      >
        Log In
      </Link>
      <Link
        href="/register"
        className="flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium text-white bg-zinc-950 rounded-md hover:bg-zinc-800 transition-all duration-200 w-full sm:w-auto outline-none"
      >
        Sign Up
      </Link>
    </>
  );

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header
        className={`pointer-events-auto
          flex flex-col items-center
          px-4 py-3 backdrop-blur-md
          ${headerShapeClass}
          border border-zinc-200 bg-white/80 shadow-sm
          w-full max-w-4xl
          transition-[border-radius] duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
          <div className="flex items-center">{logoElement}</div>

          <nav className="hidden sm:flex items-center space-x-6">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm outline-none transition-colors ${
                  checkIsActive(link.href) ? "text-zinc-950 font-semibold" : "text-zinc-500 font-medium hover:text-zinc-950"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {userButtonsElement}
          </div>

          <button
            className="sm:hidden flex items-center justify-center w-8 h-8 text-zinc-700 hover:text-zinc-950 focus:outline-none transition-colors outline-none"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div
          className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
            ${isOpen ? "max-h-250 opacity-100 pt-6 pb-2" : "max-h-0 opacity-0 pt-0 pointer-events-none"}`}
        >
          <nav className="flex flex-col items-center space-y-4 w-full">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium w-full text-center py-2 transition-colors outline-none ${
                  checkIsActive(link.href) ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col items-center space-y-3 mt-6 w-full">
            {userButtonsElement}
          </div>
        </div>
      </header>
    </div>
  );
}
