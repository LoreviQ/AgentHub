import type {
  Agent,
  AgentDetail,
  AgentExecutionResponse,
  AgentListItem,
  Invocation,
} from "@/lib/types";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  listAgents: () => jsonFetch<AgentListItem[]>("/api/agents"),
  getAgent: (id: string) => jsonFetch<AgentDetail>(`/api/agents/${id}`),
  executeAgent: (payload: { agentId: string; input: string }) =>
    jsonFetch<AgentExecutionResponse>(`/api/agents/${payload.agentId}/execute`, {
      method: "POST",
      body: JSON.stringify({ input: payload.input }),
    }),
  publishAgent: (payload: unknown) =>
    jsonFetch<Agent>("/api/agents", { method: "POST", body: JSON.stringify(payload) }),
  validatePackage: (payload: unknown) =>
    jsonFetch<{ valid: boolean; checks: string[] }>("/api/agents/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  invoke: (payload: unknown) =>
    jsonFetch<Invocation>("/api/invocations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  dashboard: () =>
    jsonFetch<{
      billing: { creditsBalance: number; monthlySpend: number; totalInvocations: number; currentPlan: string };
      invocations: Invocation[];
      apiKeys: { id: string; name: string; keyPreview: string; createdAt: string; lastUsedAt?: string }[];
    }>("/api/dashboard"),
  createApiKey: (name: string) =>
    jsonFetch<{ id: string; name: string; keyPreview: string; createdAt: string }>("/api/keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  login: (payload: { email: string; password: string }) =>
    jsonFetch<{ ok: boolean; userId: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
