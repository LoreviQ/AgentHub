import { NextResponse } from "next/server";
import { createInvocation, getDashboard } from "@/lib/mock-db";
import { invokeAgentSchema } from "@/lib/validators";

export async function GET() {
  const data = getDashboard("user_demo");
  return NextResponse.json(data.invocations);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = invokeAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invocation payload" }, { status: 400 });
  }

  try {
    const invocation = createInvocation({
      agentId: parsed.data.agentId,
      approvedPermissionIds: parsed.data.approvedPermissionIds,
      userId: "user_demo",
      prompt: parsed.data.input,
    });
    return NextResponse.json(invocation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invocation failed" },
      { status: 400 },
    );
  }
}
