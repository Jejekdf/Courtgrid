import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage && req.auth) {
    const role = req.auth.user?.role;
    const redirectUrl = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/login", "/register"],
};
