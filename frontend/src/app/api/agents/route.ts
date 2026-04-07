import { NextRequest, NextResponse } from "next/server";
import { listAgents, publishAgent } from "@/lib/mock-db";
import { publishAgentSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const agents = listAgents(req.nextUrl.searchParams);
  return NextResponse.json(agents);
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
