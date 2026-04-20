import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Protect against infinite loop and ignore API routes explicitly
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAgentRoute = nextUrl.pathname.startsWith("/agent");
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/api/setup-admin";

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      if (role === "AGENT") return NextResponse.redirect(new URL("/agent/dashboard", nextUrl));
      if (role === "COMPTABLE") return NextResponse.redirect(new URL("/admin/paiements", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Access control
  if (isAdminRoute) {
    if (role === "ADMIN") return NextResponse.next();
    if (role === "COMPTABLE" && nextUrl.pathname.startsWith("/admin/paiements")) return NextResponse.next();
    // Special case for receipts which might be shared
    if (nextUrl.pathname.startsWith("/paiements/recu")) return NextResponse.next();
    
    // Default fallback for unauthorized roles on admin routes
    if (role === "AGENT") return NextResponse.redirect(new URL("/agent/dashboard", nextUrl));
    if (role === "COMPTABLE") return NextResponse.redirect(new URL("/admin/paiements", nextUrl));
  }

  if (isAgentRoute) {
    if (role === "AGENT" || role === "ADMIN") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
