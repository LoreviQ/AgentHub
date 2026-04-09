import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_VALUE,
  getDemoSessionCookieOptions,
} from "@/lib/server/demo-auth";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = request.cookies.get(DEMO_SESSION_COOKIE);
    if (!session) {
      const response = NextResponse.next();
      response.cookies.set(
        DEMO_SESSION_COOKIE,
        DEMO_SESSION_VALUE,
        getDemoSessionCookieOptions(),
      );
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
