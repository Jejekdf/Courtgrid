"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Hexagon } from "lucide-react";

export function Header() {
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
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Close menu on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const checkIsActive = (href: string) => {
    if (pathname !== "/") return pathname === href;
    if (href === "/") return activeSection === "";
    return href === `/${activeSection}`;
  };

  const logoElement = (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0 outline-none [-webkit-tap-highlight-color:transparent]">
      <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-[0.98]">
        <Hexagon className="absolute inset-0 w-full h-full text-zinc-950 fill-zinc-950/5 stroke-[1.5]" />
        <img src="/favicon.ico" alt="CourtGrid Logo" className="absolute w-4 h-4 object-contain" />
      </div>
      <span className="text-zinc-950 font-bold tracking-tight text-base sm:text-lg">
        CourtGrid
      </span>
    </Link>
  );

  const navLinksData = [
    { label: "Home", href: "/" },
    { label: "Courts", href: "/#courts" },
    { label: "About", href: "/#about" },
  ];

  const loginButtonElement = (
    <Link
      href="/login"
      className="px-4 py-2 sm:px-4 text-xs sm:text-sm font-medium border border-zinc-200 bg-white text-zinc-950 rounded-md hover:bg-zinc-50 transition-all duration-200 w-full sm:w-auto text-center outline-none [-webkit-tap-highlight-color:transparent]"
    >
      Log In
    </Link>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
      <Link
        href="/register"
        className="relative z-10 flex items-center justify-center px-4 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-zinc-950 rounded-md hover:bg-zinc-800 transition-all duration-200 w-full sm:w-auto active:scale-[0.98] outline-none [-webkit-tap-highlight-color:transparent]"
      >
        Sign Up
      </Link>
    </div>
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
                className={`text-sm outline-none [-webkit-tap-highlight-color:transparent] transition-colors ${
                  checkIsActive(link.href) ? "text-zinc-950 font-semibold" : "text-zinc-500 font-medium hover:text-zinc-950"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {loginButtonElement}
            {signupButtonElement}
          </div>

          <button
            className="sm:hidden flex items-center justify-center w-8 h-8 text-zinc-700 hover:text-zinc-950 focus:outline-none transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
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
                className={`text-base font-medium w-full text-center py-2 transition-colors outline-none [-webkit-tap-highlight-color:transparent] ${
                  checkIsActive(link.href) ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col items-center space-y-3 mt-6 w-full">
            {loginButtonElement}
            {signupButtonElement}
          </div>
        </div>
      </header>
    </div>
  );
}
