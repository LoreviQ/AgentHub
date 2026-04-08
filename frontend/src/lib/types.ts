export type PermissionRisk = "low" | "medium" | "high";
export type TrustLevel = "community" | "verified" | "enterprise";
export type PriceModel = "per_run" | "subscription" | "usage";

export type AgentListItem = {
  id: string;
  name: string;
  description: string;
  version: string;
  model_provider: string;
  model_name: string;
  input_mode: string;
  output_mode: string;
  tools_enabled: boolean;
};

export type AgentTool = {
  name: string;
  description: string;
  image: string;
  entrypoint: string;
  input_format: string;
  output_format: string;
  timeout_seconds: number;
};

export type AgentDetail = AgentListItem & {
  schema_version: number;
  instructions_markdown: string;
  public_instructions: string;
  model_temperature: number;
  model_max_tokens: number;
  runtime_timeout_seconds: number;
  runtime_internet_access: boolean;
  runtime_execution_notes: string | null;
  package_path: string;
  example_input_path: string | null;
  example_output_path: string | null;
  example_input: string | null;
  example_output: unknown | null;
  example_output_raw: string | null;
  tools: AgentTool[];
};

export type AgentExecutionResponse = {
  run_id: number;
  agent_id: string;
  status: "completed";
  output: unknown;
  started_at: string;
  completed_at: string;
};

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
