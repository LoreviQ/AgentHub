import { NextResponse } from "next/server";
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_VALUE,
  DEMO_USER_ID,
  getDemoSessionCookieOptions,
} from "@/lib/server/demo-auth";

export async function POST(req: Request) {
  await req.json().catch(() => null);

  const response = NextResponse.json({ ok: true, userId: DEMO_USER_ID });
  response.cookies.set(
    DEMO_SESSION_COOKIE,
    DEMO_SESSION_VALUE,
    getDemoSessionCookieOptions(),
  );
  return response;
}
