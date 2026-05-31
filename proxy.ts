import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Better Auth session cookie (dev + production secure prefix + chunked names). */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const baseName = cookie.name.replace(/^__(Secure|Host)-/, "");
    return (
      Boolean(cookie.value) &&
      (baseName === "better-auth.session_token" ||
        baseName.startsWith("better-auth.session_token."))
    );
  });
}

export function proxy(request: NextRequest) {
  if (!hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
