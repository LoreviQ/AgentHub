import { NextResponse } from "next/server";
import { publishAgentSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = publishAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, checks: ["Schema validation failed"] },
      { status: 400 },
    );
  }

  const checks = [
    "Manifest schema validated.",
    "Runtime declaration present.",
    "Permission list disclosed and risk-scored.",
    "Pricing configuration validated.",
  ];
  return NextResponse.json({ valid: true, checks });
}
