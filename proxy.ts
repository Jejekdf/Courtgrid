import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Application-wide proxy that enforces route-level access control.
 *
 * Guards:
 * - /admin/* requires an authenticated ADMIN
 * - /dashboard/* requires an authenticated non-admin customer
 * - /login and /register redirect authenticated users to their home route
 *
 * This keeps routing logic centralized instead of duplicating checks
 * across every page or layout component.
 */
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  if (isAuthRoute && isLoggedIn) {
    const target = userRole === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/dashboard", "/login", "/register"],
};
