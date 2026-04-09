import type { AgentDetail, AgentListItem } from "@/lib/types";

export type AgentReview = {
  author: string;
  role: string;
  rating: number;
  quote: string;
};

export type MarketplaceAgentProfile = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  categories: string[];
  owner: string;
  creatorHandle: string;
  priceLabel: string;
  priceValue: string;
  costBlurb: string;
  rating: number;
  reviewCount: number;
  runCountLabel: string;
  trustLabel: string;
  accent: "cyan" | "pink" | "amber" | "violet" | "emerald";
  source: "live" | "display-only";
  featured: boolean;
  statusLabel: string;
  useCases: string[];
  outputSummary: string;
  examplePrompt: string;
  sampleRequestBody: Record<string, string>;
  sampleResponse: unknown;
  whyThisExists: string;
  howItWorks: string[];
  reviews: AgentReview[];
  toolSummary: string;
  displayOnlyReason?: string;
};

type LiveProfileSeed = Omit<
  MarketplaceAgentProfile,
  | "source"
  | "statusLabel"
  | "slug"
  | "sampleRequestBody"
  | "sampleResponse"
  | "outputSummary"
>;

type DisplayOnlyProfile = MarketplaceAgentProfile;

const liveProfileSeeds: Record<string, LiveProfileSeed> = {
  "legal-checker": {
    id: "legal-checker",
    name: "Legal Document Concern Checker",
    tagline: "Fast contract-risk triage for founders, ops leads, and legal teams.",
    description:
      "Reads contract or policy text and flags the clauses a human should inspect before signature.",
    longDescription:
      "This agent is tuned for quick first-pass contract review. It is meant to surface the parts of a document that deserve human follow-up, not to replace legal advice. For the marketplace demo, this is one of the two real packaged agents that can be executed live through the shared AgentHub runtime.",
    categories: ["Legal", "Risk", "Founders"],
    owner: "AgentHub Core",
    creatorHandle: "@agenthub/legal-lab",
    priceLabel: "Demo price",
    priceValue: "$0.08 / run",
    costBlurb:
      "Low-cost LLM-only execution intended for lightweight legal triage flows.",
    rating: 4.9,
    reviewCount: 26,
    runCountLabel: "1.2k sandbox runs",
    trustLabel: "Platform verified",
    accent: "cyan",
    featured: true,
    useCases: [
      "Review vendor agreements before redline",
      "Spot renewal, liability, and subprocessor risks",
      "Give another assistant a safe escalation target",
    ],
    examplePrompt:
      "This agreement renews automatically for successive 24-month terms unless either party gives notice at least 90 days before renewal. The customer may not terminate for convenience. Vendor liability is capped at fees paid in the prior one month, including for confidentiality breaches. Vendor may change subprocessors at any time by updating its website.",
    whyThisExists:
      "Contract review is easy to explain in a demo and clearly shows why curated specialist agents are useful.",
    howItWorks: [
      "AgentHub loads the packaged instructions and runtime config from the agent bundle.",
      "The shared runtime assembles the final system prompt and sends the user text to the selected model.",
      "The result is returned as concise markdown with concerns and follow-up questions.",
    ],
    reviews: [
      {
        author: "Mina Patel",
        role: "Startup COO",
        rating: 5,
        quote:
          "Perfect as a pre-lawyer pass. It immediately called out the one-sided renewal and liability terms.",
      },
      {
        author: "Dae Kim",
        role: "AI Ops Lead",
        rating: 5,
        quote:
          "Useful as a delegated specialist from a broader assistant workflow. Fast and easy to verify.",
      },
    ],
    toolSummary:
      "No custom tools. This is a pure prompt + model demo running on the shared AgentHub execution loop.",
  },
  "clause-extractor": {
    id: "clause-extractor",
    name: "Clause Extractor Assistant",
    tagline: "Structured clause extraction with optional packaged tool support.",
    description:
      "Extracts normalized clause objects from legal or policy text and explains the result.",
    longDescription:
      "This agent demonstrates the stronger marketplace claim: AgentHub is not just a prompt host. It can run packaged agents that selectively call approved custom tool code while staying inside one platform-controlled execution path.",
    categories: ["Legal", "Extraction", "Structured Data"],
    owner: "AgentHub Core",
    creatorHandle: "@agenthub/extraction-lab",
    priceLabel: "Demo price",
    priceValue: "$0.14 / run",
    costBlurb:
      "Slightly higher due to structured output handling and optional one-shot tool invocation.",
    rating: 4.8,
    reviewCount: 18,
    runCountLabel: "740 tool-aware runs",
    trustLabel: "Platform verified",
    accent: "pink",
    featured: true,
    useCases: [
      "Transform contracts into structured clause records",
      "Feed downstream compliance or review workflows",
      "Show selective tool use inside a curated runtime",
    ],
    examplePrompt:
      "Customer may terminate for material breach if the vendor fails to cure within 30 days of written notice. The agreement renews automatically for one-year terms unless either party gives 60 days' notice. Vendor may process customer data using approved subprocessors listed in Annex B.",
    whyThisExists:
      "It proves that one marketplace can host agents with different execution shapes while preserving a single platform runtime.",
    howItWorks: [
      "AgentHub loads the same shared runtime path used by every agent.",
      "During execution the model may decide to call the packaged extraction tool.",
      "The final response preserves structured clause objects for downstream systems or assistants.",
    ],
    reviews: [
      {
        author: "Rhea Santos",
        role: "Compliance Engineer",
        rating: 5,
        quote:
          "The JSON shape was clean enough to slot straight into an ingestion pipeline. Great demo of tool use.",
      },
      {
        author: "Leo Wu",
        role: "Founding Engineer",
        rating: 4,
        quote:
          "Makes the A2A story concrete. Another assistant can invoke it without knowing any contract heuristics.",
      },
    ],
    toolSummary:
      "Includes an approved packaged extraction tool image that the runtime may invoke for higher-confidence structured output.",
  },
};

export const displayOnlyAgents: DisplayOnlyProfile[] = [
  {
    id: "redline-ghost",
    slug: "redline-ghost",
    name: "Redline Ghost",
    tagline: "Suggests negotiation-ready fallback language for contract redlines.",
    description:
      "A display-only marketplace listing showing how creator agents might appear once open publishing exists.",
    longDescription:
      "This mock listing is intentionally non-functional. It exists to make the marketplace feel fuller while clearly signaling that only two curated agents are live in the MVP.",
    categories: ["Legal", "Negotiation", "Templates"],
    owner: "SignalDraft Labs",
    creatorHandle: "@signaldraft",
    priceLabel: "Projected price",
    priceValue: "$19 / seat",
    costBlurb:
      "Subscription-style specialist agent pricing shown for marketplace realism.",
    rating: 4.7,
    reviewCount: 41,
    runCountLabel: "Display listing",
    trustLabel: "Creator submitted",
    accent: "violet",
    source: "display-only",
    featured: false,
    statusLabel: "Display only",
    useCases: [
      "Draft fallback language during redlines",
      "Summarize negotiation posture by clause type",
      "Pair with a legal ops approval flow",
    ],
    outputSummary: "Returns markdown suggestions and fallback clause options.",
    examplePrompt: "Suggest safer fallback language for this indemnity clause.",
    sampleRequestBody: { input: "Suggest safer fallback language for this clause." },
    sampleResponse: {
      note: "Display-only mock response",
      suggestions: ["Cap liability carve-outs", "Add mutual notification obligations"],
    },
    whyThisExists:
      "Demonstrates what a third-party creator listing could look like after onboarding and publishing exist.",
    howItWorks: [
      "In the future this would be a packaged marketplace submission.",
      "For the MVP it is a frontend-only card with no live backend execution.",
    ],
    reviews: [
      {
        author: "A. Reed",
        role: "Legal Ops",
        rating: 5,
        quote: "Exactly the kind of specialist I'd want in a future marketplace.",
      },
    ],
    toolSummary: "Display-only listing. No live runtime attached in the MVP.",
    displayOnlyReason: "Mock listing for marketplace depth. Not executable in this demo.",
  },
  {
    id: "threat-model-forge",
    slug: "threat-model-forge",
    name: "Threat Model Forge",
    tagline: "Turns product briefs into attack-surface and abuse-case checklists.",
    description:
      "A mock security-agent listing included to give the marketplace broader vertical flavor.",
    longDescription:
      "This one is here to show how the marketplace could expand beyond legal specialists into engineering and security workflows.",
    categories: ["Security", "Architecture", "Threat Modeling"],
    owner: "Blackglass Systems",
    creatorHandle: "@blackglass",
    priceLabel: "Projected price",
    priceValue: "$0.22 / run",
    costBlurb: "Per-run pricing designed for technical planning and review workflows.",
    rating: 4.8,
    reviewCount: 33,
    runCountLabel: "Display listing",
    trustLabel: "Enterprise creator",
    accent: "emerald",
    source: "display-only",
    featured: false,
    statusLabel: "Display only",
    useCases: [
      "Turn product briefs into threat model drafts",
      "Generate abuse-case checklists for security review",
      "Support architecture reviews with a specialist lens",
    ],
    outputSummary: "Returns risk tables, abuse cases, and mitigations.",
    examplePrompt: "Threat-model this browser extension product spec.",
    sampleRequestBody: { input: "Threat-model this browser extension product spec." },
    sampleResponse: {
      note: "Display-only mock response",
      threats: ["Privilege escalation via content script", "Leaked extension secrets"],
    },
    whyThisExists:
      "Shows that the marketplace can eventually span multiple specialist domains, not just one demo niche.",
    howItWorks: [
      "Would eventually run through the same platform runtime contract.",
      "For now it is frontend-only and labeled as display-only.",
    ],
    reviews: [
      {
        author: "Jun Park",
        role: "Security PM",
        rating: 4,
        quote: "If this were live I'd use it in every kickoff review.",
      },
    ],
    toolSummary: "Display-only listing. Included for marketplace atmosphere and product storytelling.",
    displayOnlyReason: "Mock listing for breadth. Not wired to backend execution.",
  },
  {
    id: "dao-treasury-sentinel",
    slug: "dao-treasury-sentinel",
    name: "DAO Treasury Sentinel",
    tagline: "Mock on-chain ops analyst for governance, treasury, and policy reviews.",
    description:
      "A web3-flavored display listing included to make the marketplace feel like a broader ecosystem.",
    longDescription:
      "This listing leans into the cyberpunk/web3 aesthetic you asked for and gives the marketplace a more expansive dev-native feel without pretending it is live.",
    categories: ["Web3", "Governance", "Treasury"],
    owner: "NightShift Protocol",
    creatorHandle: "@nightshift",
    priceLabel: "Projected price",
    priceValue: "$49 / month",
    costBlurb: "Monthly specialist pricing for recurring governance workflows.",
    rating: 4.6,
    reviewCount: 29,
    runCountLabel: "Display listing",
    trustLabel: "DAO verified",
    accent: "amber",
    source: "display-only",
    featured: true,
    statusLabel: "Display only",
    useCases: [
      "Review governance proposals for treasury risk",
      "Summarize delegate concerns and budget anomalies",
      "Track policy drift across governance docs",
    ],
    outputSummary: "Returns governance notes, anomalies, and suggested next actions.",
    examplePrompt: "Summarize treasury risks in this governance proposal.",
    sampleRequestBody: { input: "Summarize treasury risks in this governance proposal." },
    sampleResponse: {
      note: "Display-only mock response",
      flags: ["Concentration risk", "No emergency veto path"],
    },
    whyThisExists:
      "It gives the marketplace the broader ecosystem feel of a future creator economy without confusing which agents are truly live today.",
    howItWorks: [
      "Would eventually package protocol-specific policies and tooling.",
      "In this MVP it is clearly marked as a display-only marketplace concept.",
    ],
    reviews: [
      {
        author: "Nox",
        role: "Protocol Delegate",
        rating: 5,
        quote: "Exactly the kind of weird niche agent a real marketplace should surface.",
      },
    ],
    toolSummary: "Display-only listing. Visual flavor only for the MVP demo.",
    displayOnlyReason: "Mock listing for marketplace density. Not executable.",
  },
];

export function buildLiveMarketplaceProfile(
  agent: AgentListItem,
  detail?: AgentDetail,
): MarketplaceAgentProfile {
  const seed =
    liveProfileSeeds[agent.id] ??
    ({
      id: agent.id,
      name: agent.name,
      tagline: agent.marketplace_short_pitch ?? agent.description,
      description: agent.description,
      longDescription: agent.description,
      categories:
        Array.isArray(agent.marketplace_categories) && agent.marketplace_categories.length > 0
          ? agent.marketplace_categories
          : ["General"],
      owner: "AgentHub Creator",
      creatorHandle: "@agenthub/creator",
      priceLabel: "Price",
      priceValue: agent.marketplace_price ?? "Unspecified",
      costBlurb: "Marketplace-managed pricing for this packaged agent.",
      rating: agent.marketplace_rating ?? 0,
      reviewCount: agent.marketplace_review_count ?? 0,
      runCountLabel: "Live listing",
      trustLabel: agent.marketplace_trust_badge ?? "Pending review",
      accent: "cyan",
      featured: agent.marketplace_featured ?? false,
      useCases: detail?.marketplace_use_cases ?? [agent.description],
      examplePrompt: detail?.example_input ?? "Describe the task you want this agent to handle.",
      whyThisExists:
        "This live agent was loaded from the backend registry and rendered without a bespoke frontend seed.",
      howItWorks: [
        "AgentHub loads the packaged instructions and runtime config from the agent bundle.",
        "The shared runtime executes the request using the configured model and tools policy.",
        "The result is returned through the same platform-managed execution path as every other live agent.",
      ],
      reviews: [],
      toolSummary: agent.tools_enabled
        ? "This live agent has packaged tool support enabled."
        : "This live agent runs through the shared runtime without custom tools.",
    } satisfies LiveProfileSeed);
  const fallbackCategories =
    Array.isArray(agent.marketplace_categories) && agent.marketplace_categories.length > 0
      ? agent.marketplace_categories
      : seed?.categories ?? ["General"];
  const exampleInput = detail?.example_input ?? seed.examplePrompt;
  const exampleOutput =
    detail?.example_output ??
    (detail?.example_output_raw ? detail.example_output_raw : null) ??
    {
      note: "Example output is loaded from the packaged agent files when available.",
    };

  return {
    ...seed,
    tagline: agent.marketplace_short_pitch ?? seed.tagline,
    categories: fallbackCategories,
    priceValue: agent.marketplace_price ?? seed.priceValue,
    rating: agent.marketplace_rating ?? seed.rating,
    reviewCount: agent.marketplace_review_count ?? seed.reviewCount,
    trustLabel: agent.marketplace_trust_badge ?? seed.trustLabel,
    featured: agent.marketplace_featured ?? seed.featured,
    useCases: detail?.marketplace_use_cases ?? seed.useCases,
    slug: agent.id,
    source: "live",
    statusLabel: "Live in Demo",
    sampleRequestBody: { input: exampleInput },
    sampleResponse: exampleOutput,
    outputSummary: `${agent.output_mode} output via ${agent.model_provider}/${agent.model_name}`,
  };
}

export function getDisplayOnlyAgent(id: string): DisplayOnlyProfile | undefined {
  return displayOnlyAgents.find((agent) => agent.id === id);
}

export function getCatalogAgentIds(): string[] {
  return [
    ...Object.keys(liveProfileSeeds),
    ...displayOnlyAgents.map((agent) => agent.id),
  ];
}
