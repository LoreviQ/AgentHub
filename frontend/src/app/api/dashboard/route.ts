import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/mock-db";
import { getMcpServerUrl } from "@/lib/server/mcp-config";

export async function GET() {
  const data = getDashboard("user_demo");
  return NextResponse.json({
    ...data,
    mcp: {
      transport: "streamable-http",
      serverUrl: getMcpServerUrl(),
      bearerTokenEnvVar: "AGENTHUB_MCP_BEARER_TOKEN",
      backendUrlEnvVar: "AGENTHUB_BACKEND_URL",
      addressEnvVar: "NEXT_MCP_ADDRESS",
    },
  });
}
