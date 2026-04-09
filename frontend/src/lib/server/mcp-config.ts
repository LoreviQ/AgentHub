function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getBackendUrl(): string {
  return trimTrailingSlash(requireEnv("AGENTHUB_BACKEND_URL"));
}

export function getMcpServerUrl(): string {
  return trimTrailingSlash(requireEnv("NEXT_MCP_ADDRESS"));
}
