import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/mock-db";

export async function GET() {
  const data = getDashboard("user_demo");
  return NextResponse.json(data);
}
