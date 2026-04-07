import { NextResponse } from "next/server";
import { addApiKey } from "@/lib/mock-db";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim() || "New Integration Key";
  const key = addApiKey(name);
  return NextResponse.json(key, { status: 201 });
}
