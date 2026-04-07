import { randomUUID } from "crypto";
import type {
  Agent,
  ApiKey,
  BillingSummary,
  CreatorSubmission,
  Invocation,
} from "@/lib/types";

type DB = {
  agents: Agent[];
  invocations: Invocation[];
  billing: BillingSummary;
  apiKeys: ApiKey[];
};

declare global {
  var __agenthubDB: DB | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function seedDB(): DB {
  const agents: Agent[] = [
    {
      id: "ag_legal_guard",
      slug: "legal-guard-pro",
      name: "Legal Guard Pro",
      tagline: "Enterprise contract risk review with redline suggestions.",
      description:
        "Analyzes procurement, NDA, and MSA documents against your policy pack and returns an audit-ready risk summary with clause-level suggestions.",
      categories: ["Legal", "Compliance"],
      capabilities: ["Contract review", "Policy matching", "Risk scoring"],
      permissions: [
        {
          id: "perm_docs_read",
          name: "Read uploaded documents",
          description: "Read invocation-bound contract files for analysis.",
          risk: "medium",
          required: true,
        },
        {
          id: "perm_model_inference",
          name: "Run managed model inference",
          description: "Use AgentHub-managed LLM inference APIs.",
          risk: "low",
          required: true,
        },
      ],
      trustLevel: "enterprise",
      verified: true,
      priceModel: "per_run",
      price: 18,
      currency: "USD",
      avgRating: 4.9,
      totalReviews: 128,
      totalRuns: 5921,
      successRate: 98.9,
      owner: "LexiOps",
      createdAt: nowIso(),
    },
    {
      id: "ag_code_migrate",
      slug: "legacy-code-migrator",
      name: "Legacy Code Migrator",
      tagline: "Modernize services with bounded runtime migration plans.",
      description:
        "Migrates legacy endpoints and module patterns to modern frameworks while producing diff plans and rollback-safe checklists.",
      categories: ["Engineering"],
      capabilities: ["Code transformation", "Test scaffolding", "Migration plan"],
      permissions: [
        {
          id: "perm_repo_read",
          name: "Read repository snapshot",
          description: "Read source code attached to this invocation.",
          risk: "medium",
          required: true,
        },
        {
          id: "perm_repo_write_patch",
          name: "Write patch output",
          description: "Write generated patch artifacts to invocation output.",
          risk: "high",
          required: false,
        },
      ],
      trustLevel: "verified",
      verified: true,
      priceModel: "usage",
      price: 0.15,
      currency: "USD",
      avgRating: 4.7,
      totalReviews: 74,
      totalRuns: 2104,
      successRate: 96.1,
      owner: "Refactor Labs",
      createdAt: nowIso(),
    },
    {
      id: "ag_research_synth",
      slug: "research-synthesis-agent",
      name: "Research Synthesis Agent",
      tagline: "High-signal multi-source synthesis for executive briefs.",
      description:
        "Aggregates uploaded notes and citations into concise insight briefs, confidence labels, and open-question inventories.",
      categories: ["Research", "Strategy"],
      capabilities: ["Synthesis", "Citation mapping", "Brief generation"],
      permissions: [
        {
          id: "perm_notes_read",
          name: "Read invocation notes",
          description: "Read private notes passed in this invocation only.",
          risk: "low",
          required: true,
        },
      ],
      trustLevel: "community",
      verified: false,
      priceModel: "subscription",
      price: 39,
      currency: "USD",
      avgRating: 4.5,
      totalReviews: 31,
      totalRuns: 904,
      successRate: 94.4,
      owner: "Insight Foundry",
      createdAt: nowIso(),
    },
  ];

  const invocations: Invocation[] = [
    {
      id: "inv_001",
      agentId: agents[0].id,
      agentName: agents[0].name,
      userId: "user_demo",
      input: "Review MSA v3 for indemnity and liability risk.",
      approvedPermissionIds: ["perm_docs_read", "perm_model_inference"],
      status: "completed",
      result:
        "Detected 3 high-risk clauses and 5 medium-risk clauses. Suggested redlines attached in execution artifacts.",
      costCredits: 18,
      startedAt: nowIso(),
      completedAt: nowIso(),
      auditTrail: [
        {
          at: nowIso(),
          event: "ENV_PROVISIONED",
          detail: "Ephemeral secure container provisioned.",
        },
        {
          at: nowIso(),
          event: "PERMISSION_ENFORCED",
          detail: "Approved permissions mounted; network disabled by policy.",
        },
        {
          at: nowIso(),
          event: "EXECUTION_COMPLETE",
          detail: "Result returned and environment destroyed.",
        },
      ],
    },
  ];

  return {
    agents,
    invocations,
    billing: {
      userId: "user_demo",
      creditsBalance: 1260,
      monthlySpend: 248,
      totalInvocations: invocations.length,
      currentPlan: "Enterprise Trial",
    },
    apiKeys: [
      {
        id: "key_01",
        name: "Assistant Integration",
        keyPreview: "ah_live_************7Qe2",
        createdAt: nowIso(),
        lastUsedAt: nowIso(),
      },
    ],
  };
}

function getDB() {
  if (!global.__agenthubDB) {
    global.__agenthubDB = seedDB();
  }
  return global.__agenthubDB;
}

export function listAgents(searchParams: URLSearchParams) {
  const db = getDB();
  const q = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");
  const trust = searchParams.get("trust");
  const priceModel = searchParams.get("priceModel");
  const permissionRisk = searchParams.get("permissionRisk");
  const minRating = Number(searchParams.get("minRating") ?? 0);

  return db.agents.filter((agent) => {
    const matchesQuery =
      !q ||
      agent.name.toLowerCase().includes(q) ||
      agent.tagline.toLowerCase().includes(q) ||
      agent.capabilities.some((c) => c.toLowerCase().includes(q));
    const matchesCategory = !category || agent.categories.includes(category);
    const matchesTrust = !trust || agent.trustLevel === trust;
    const matchesPriceModel = !priceModel || agent.priceModel === priceModel;
    const matchesRisk =
      !permissionRisk ||
      agent.permissions.some((permission) => permission.risk === permissionRisk);

    return (
      matchesQuery &&
      matchesCategory &&
      matchesTrust &&
      matchesPriceModel &&
      matchesRisk &&
      agent.avgRating >= minRating
    );
  });
}

export function getAgentById(id: string) {
  return getDB().agents.find((agent) => agent.id === id || agent.slug === id);
}

export function publishAgent(input: CreatorSubmission) {
  const db = getDB();
  const agent: Agent = {
    id: `ag_${randomUUID().slice(0, 8)}`,
    slug: input.name.toLowerCase().replace(/\s+/g, "-"),
    name: input.name,
    tagline: input.tagline,
    description: input.description,
    categories: input.categories,
    capabilities: input.capabilities,
    permissions: input.permissions,
    trustLevel: "community",
    verified: false,
    priceModel: input.priceModel,
    price: input.price,
    currency: "USD",
    avgRating: 0,
    totalReviews: 0,
    totalRuns: 0,
    successRate: 0,
    owner: input.owner,
    createdAt: nowIso(),
  };
  db.agents.unshift(agent);
  return agent;
}

export function createInvocation(input: {
  agentId: string;
  approvedPermissionIds: string[];
  userId: string;
  prompt: string;
}) {
  const db = getDB();
  const agent = getAgentById(input.agentId);
  if (!agent) throw new Error("Agent not found");

  const requiredIds = agent.permissions
    .filter((p) => p.required)
    .map((p) => p.id)
    .sort();
  const approvedIds = [...input.approvedPermissionIds].sort();
  if (requiredIds.some((id) => !approvedIds.includes(id))) {
    throw new Error("Required permissions were not approved.");
  }

  const id = `inv_${randomUUID().slice(0, 8)}`;
  const startedAt = nowIso();
  const invocation: Invocation = {
    id,
    agentId: agent.id,
    agentName: agent.name,
    userId: input.userId,
    input: input.prompt,
    approvedPermissionIds: input.approvedPermissionIds,
    status: "completed",
    result:
      "Execution finished in an ephemeral container. Result payload delivered with full audit logs and policy attestations.",
    costCredits: Math.max(1, Math.round(agent.price * 10)),
    startedAt,
    completedAt: nowIso(),
    auditTrail: [
      {
        at: startedAt,
        event: "ENV_SPINUP",
        detail: "Isolated runtime provisioned from signed template image.",
      },
      {
        at: nowIso(),
        event: "POLICY_ENFORCEMENT",
        detail: "Default-deny network posture active; approved scopes mounted.",
      },
      {
        at: nowIso(),
        event: "EXECUTION_DONE",
        detail: "Result emitted. Runtime terminated and storage scrubbed.",
      },
    ],
  };

  db.invocations.unshift(invocation);
  db.billing.creditsBalance -= invocation.costCredits;
  db.billing.monthlySpend += invocation.costCredits;
  db.billing.totalInvocations += 1;
  return invocation;
}

export function getDashboard(userId: string) {
  const db = getDB();
  return {
    billing: db.billing,
    invocations: db.invocations.filter((inv) => inv.userId === userId),
    apiKeys: db.apiKeys,
  };
}

export function addApiKey(name: string) {
  const db = getDB();
  const key: ApiKey = {
    id: `key_${randomUUID().slice(0, 6)}`,
    name,
    keyPreview: `ah_live_************${randomUUID().slice(0, 4)}`,
    createdAt: nowIso(),
  };
  db.apiKeys.unshift(key);
  return key;
}
