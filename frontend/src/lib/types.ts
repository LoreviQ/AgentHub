export type PermissionRisk = "low" | "medium" | "high";
export type TrustLevel = "community" | "verified" | "enterprise";
export type PriceModel = "per_run" | "subscription" | "usage";

export type AgentPermission = {
  id: string;
  name: string;
  description: string;
  risk: PermissionRisk;
  required: boolean;
};

export type AgentReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Agent = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  capabilities: string[];
  permissions: AgentPermission[];
  trustLevel: TrustLevel;
  verified: boolean;
  priceModel: PriceModel;
  price: number;
  currency: "USD";
  avgRating: number;
  totalReviews: number;
  totalRuns: number;
  successRate: number;
  owner: string;
  createdAt: string;
};

export type InvocationStatus = "queued" | "running" | "completed" | "failed";

export type Invocation = {
  id: string;
  agentId: string;
  agentName: string;
  userId: string;
  input: string;
  approvedPermissionIds: string[];
  status: InvocationStatus;
  result: string;
  costCredits: number;
  startedAt: string;
  completedAt?: string;
  auditTrail: { at: string; event: string; detail: string }[];
};

export type CreatorSubmission = {
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  capabilities: string[];
  permissions: AgentPermission[];
  priceModel: PriceModel;
  price: number;
  owner: string;
  packageVersion: string;
  entryPoint: string;
  runtime: string;
};

export type BillingSummary = {
  userId: string;
  creditsBalance: number;
  monthlySpend: number;
  totalInvocations: number;
  currentPlan: string;
};

export type ApiKey = {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string;
};
