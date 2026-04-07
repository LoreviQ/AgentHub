import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, userId: "user_demo" });
  response.cookies.set("agenthub_session", "session_demo", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
