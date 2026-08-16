import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

/**
 * Application-wide proxy that enforces route-level access control with
 * locale-aware routing (next-intl, localePrefix: "always").
 *
 * Guards:
 * - /{locale}/admin/* requires an authenticated ADMIN
 * - /{locale}/dashboard/* requires an authenticated non-admin customer
 * - /{locale}/login and /{locale}/register redirect authenticated users to their home route
 *
 * The next-intl middleware (handleI18nRouting) is composed AFTER the guards so
 * redirects produced here always carry the correct locale prefix.
 */
const handleI18nRouting = createMiddleware(routing);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const match = /^\/(id|en)(?:\/|$)/.exec(pathname);
  const locale = match?.[1] ?? routing.defaultLocale;
  const logicalPath = match
    ? pathname.slice(match[1].length + 1) || "/"
    : pathname;

  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const toLocale = (target: string) =>
    new URL(`/${locale}${target === "/" ? "" : target}`, req.nextUrl);

  const isAdminRoute = logicalPath.startsWith("/admin");
  const isDashboardRoute = logicalPath.startsWith("/dashboard");
  const isAuthRoute =
    logicalPath.startsWith("/login") || logicalPath.startsWith("/register");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(toLocale("/login"));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(toLocale("/"));
    }
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(toLocale("/login"));
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(toLocale("/admin"));
    }
  }

  if (isAuthRoute && isLoggedIn) {
    const target = userRole === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(toLocale(target));
  }

  return handleI18nRouting(req);
});

export default proxy;

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};