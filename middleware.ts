import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

const DASHBOARD_PATH = "/dashboard";

function isProtected(pathname: string) {
  return (
    pathname.startsWith(DASHBOARD_PATH) || pathname.startsWith("/api/links")
  );
}

function isPublic(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/public")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname) && !isPublic(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/links") && request.method === "GET") {
    return NextResponse.next();
  }

  const token = request.cookies.get(sessionCookieName)?.value;
  const session = await verifySessionToken(token);

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (isProtected(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
