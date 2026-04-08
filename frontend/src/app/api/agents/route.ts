import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/server/backend-api";
import { publishAgent } from "@/lib/mock-db";
import { publishAgentSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const response = await fetchBackend(`/api/agents${req.nextUrl.search}`);
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = publishAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const agent = publishAgent(parsed.data);
  return NextResponse.json(agent, { status: 201 });
}
