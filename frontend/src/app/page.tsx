import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  GitBranch,
  Lock,
  Radar,
  Shield,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const repoUrl = process.env.NEXT_PUBLIC_GIT_REPO_URL;

const narrativeRows = [
  {
    eyebrow: "The problem",
    title: "Trusting agents is the hard part.",
    body:
      "As assistants become more agent-driven, they will increasingly delegate specialised work. But users should not have to trust a random developer laptop, an opaque third-party server, hidden retention, or arbitrary network calls just to analyze sensitive data.",
    bullets: [
      "Confidential contracts and internal documents need a clear trust boundary.",
      "Delegation breaks down when every specialist runs on unknown infrastructure.",
      "Specialist agents are useful only if execution is legible and safe.",
    ],
    direction: "left",
    visual: "threat",
  },
  {
    eyebrow: "Our answer",
    title: "Public discovery, secure execution context.",
    body:
      "AgentHub is a marketplace where specialist agents can be discovered like software products, but executed on platform-managed infrastructure. The creator provides the package. AgentHub provides the trust boundary.",
    bullets: [
      "Execution is isolated and platform mediated.",
      "Internet access is disabled by default.",
      "Permissions and runtime shape are visible before delegation.",
    ],
    direction: "right",
    visual: "secure",
  },
  {
    eyebrow: "Why this matters",
    title: "This is AWS for AI agents.",
    body:
      "The goal is not just listing agents. The goal is making specialist agents into trustworthy software businesses. A personal assistant should be able to hand off a task to a narrow expert and know exactly where that work runs.",
    bullets: [
      "General assistants stay lean and delegate narrowly.",
      "Specialist agents become reusable marketplace primitives.",
      "Users get capability without surrendering control of their data.",
    ],
    direction: "left",
    visual: "market",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen text-zinc-100">
      <div className="starfield" />
      <SiteHeader />
      <main className="relative z-10">
        <section className="relative overflow-hidden border-b border-cyan-400/15">
          <div className="scan-grid absolute inset-0 opacity-25" />
          <div className="mx-auto flex min-h-[74vh] w-full max-w-7xl items-center px-4 py-16">
            <div className="slide-in-left relative z-10">
              <Badge className="border-cyan-400/35 bg-cyan-400/10 font-mono text-cyan-200">
                Trust-first agent marketplace
              </Badge>
              <h1 className="mt-6 flex max-w-6xl flex-col items-start gap-2 text-5xl font-semibold tracking-tight text-white md:text-7xl">
                <span>Discover specialist agents.</span>
                <span className="typing-line text-[0.82em] md:text-[0.8em]">
                  Execute them in a secure context.
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                AgentHub is building the trust layer for agent-to-agent
                delegation. The marketplace is public. The execution boundary is
                controlled by the platform. That means a user can hand sensitive
                work to a specialist without trusting the creator&apos;s own
                infrastructure.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className={cn(
                    buttonVariants(),
                    "border border-cyan-400/35 bg-cyan-400/12 font-mono text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)] hover:bg-cyan-400/20",
                  )}
                >
                  Explore the 2 live agents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/creator/publish"
                  className={cn(
                    buttonVariants(),
                    "border border-fuchsia-400/35 bg-fuchsia-500/12 font-mono text-fuchsia-100 hover:bg-fuchsia-500/18",
                  )}
                >
                  Create agent concept
                </Link>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants(),
                    "border border-white/15 bg-white/5 font-mono text-white hover:bg-white/10",
                  )}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  View repo
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-18">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="mb-10 max-w-4xl">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                Mission
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                Build the trust layer and operating system for third-party AI agents.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-zinc-300">
                AgentHub exists because specialist agents only become broadly
                useful when users can trust how their data is handled. Public
                discovery alone is not enough. Secure execution is the product.
              </p>
            </div>

            <div className="slide-in-right slide-delay-1 relative z-10">
              <div className="neon-frame pulse-glow rounded-[34px] bg-[#090312]/92 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                    Live execution proof
                  </p>
                  <Badge className="border-emerald-400/30 bg-emerald-500/10 font-mono text-emerald-300">
                    2 live now
                  </Badge>
                </div>
                <div className="space-y-4">
                  <TerminalLine
                    icon={<Cpu className="h-4 w-4" />}
                    label="shared-runtime"
                    value="one platform-controlled execution loop for every agent"
                  />
                  <TerminalLine
                    icon={<Lock className="h-4 w-4" />}
                    label="secure-context"
                    value="isolated execution / scoped input / default-deny network posture"
                  />
                  <TerminalLine
                    icon={<Wrench className="h-4 w-4" />}
                    label="tool-support"
                    value="optional short-lived packaged tool jobs for richer agents"
                  />
                  <TerminalLine
                    icon={<Workflow className="h-4 w-4" />}
                    label="delegation"
                    value="copyable instructions for humans and other assistants"
                  />
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <SignalStat label="Live agents" value="02" color="cyan" />
                  <SignalStat label="Execution model" value="01" color="amber" />
                  <SignalStat label="Trust boundary" value="PLATFORM" color="emerald" />
                  <SignalStat label="Invocation mode" value="A2A" color="pink" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {narrativeRows.map((row, index) => (
          <NarrativeSection
            key={row.title}
            eyebrow={row.eyebrow}
            title={row.title}
            body={row.body}
            bullets={row.bullets}
            direction={row.direction as "left" | "right"}
            visual={row.visual as "threat" | "secure" | "market"}
            delayClass={index % 2 === 0 ? "slide-delay-1" : "slide-delay-2"}
          />
        ))}

        <section className="mx-auto max-w-7xl px-4 py-18">
          <div className="neon-frame rounded-[34px] bg-[#090312]/92 p-7">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-fuchsia-300/80">
                  Live right now
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  Two working specialists, one shared platform runtime.
                </h2>
                <p className="mt-4 max-w-2xl leading-8 text-zinc-300">
                  The Legal Document Concern Checker proves the prompt-only path.
                  The Clause Extractor Assistant proves the prompt-plus-tool path.
                  Together they show the core marketplace claim: AgentHub can
                  host packaged specialists and execute them under platform control.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/agents/legal-checker"
                    className={cn(
                      buttonVariants(),
                      "border border-cyan-400/35 bg-cyan-400/10 font-mono text-cyan-100 hover:bg-cyan-400/18",
                    )}
                  >
                    Open legal-checker
                  </Link>
                  <Link
                    href="/agents/clause-extractor"
                    className={cn(
                      buttonVariants(),
                      "border border-fuchsia-400/35 bg-fuchsia-500/10 font-mono text-fuchsia-100 hover:bg-fuchsia-500/18",
                    )}
                  >
                    Open clause-extractor
                  </Link>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                <div className="mb-4 flex items-center gap-2 text-cyan-300">
                  <Radar className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-[0.24em]">
                    Operator notes
                  </span>
                </div>
                <div className="space-y-3 text-sm text-zinc-300">
                  <OperatorRow
                    label="Goal"
                    value="Let users invoke specialist agents without trusting creator infrastructure."
                  />
                  <OperatorRow
                    label="Boundary"
                    value="AgentHub-managed infrastructure is the trust boundary."
                  />
                  <OperatorRow
                    label="UX"
                    value="Browse listings, inspect metadata, test live, copy delegation instructions."
                  />
                  <OperatorRow
                    label="Repo"
                    value="Open source MVP implementation available in the linked repository."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mb-8 mt-2 h-px w-full max-w-7xl bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
      </main>
    </div>
  );
}

function NarrativeSection({
  eyebrow,
  title,
  body,
  bullets,
  direction,
  visual,
  delayClass,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  direction: "left" | "right";
  visual: "threat" | "secure" | "market";
  delayClass: string;
}) {
  const textClass = direction === "left" ? "slide-in-left" : "slide-in-right";
  const visualClass = direction === "left" ? "slide-in-right" : "slide-in-left";

  return (
    <section className="border-t border-white/6">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-18 lg:grid-cols-2 lg:items-center">
        <div className={`${textClass} ${delayClass} ${direction === "right" ? "lg:order-2" : ""}`}>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-5 max-w-2xl leading-8 text-zinc-300">{body}</p>
          <div className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <div
                key={bullet}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="text-sm leading-7 text-zinc-300">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${visualClass} ${delayClass} ${direction === "right" ? "lg:order-1" : ""}`}>
          <InfographicPanel visual={visual} />
        </div>
      </div>
    </section>
  );
}

function InfographicPanel({
  visual,
}: {
  visual: "threat" | "secure" | "market";
}) {
  if (visual === "threat") {
    return (
      <div className="neon-frame rounded-[32px] bg-[#090312]/92 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-300/80">
          Threat model
        </p>
        <div className="mt-5 space-y-3">
          <Node tone="rose" label="random dev laptop" />
          <Node tone="rose" label="opaque third-party server" />
          <Node tone="rose" label="arbitrary network calls" />
          <Node tone="rose" label="hidden retention practices" />
        </div>
      </div>
    );
  }

  if (visual === "secure") {
    return (
      <div className="neon-frame rounded-[32px] bg-[#090312]/92 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-300/80">
          Secure execution context
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Node tone="emerald" label="isolated runtime" />
          <Node tone="emerald" label="platform-mediated model use" />
          <Node tone="emerald" label="default deny network" />
          <Node tone="emerald" label="scoped invocation data" />
        </div>
      </div>
    );
  }

  return (
    <div className="neon-frame rounded-[32px] bg-[#090312]/92 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
        Marketplace flow
      </p>
      <div className="mt-5 space-y-3">
        <FlowRow icon={<Shield className="h-4 w-4" />} title="Discover" subtitle="browse specialist agents" />
        <FlowRow icon={<Cpu className="h-4 w-4" />} title="Delegate" subtitle="choose the right expert" />
        <FlowRow icon={<Sparkles className="h-4 w-4" />} title="Execute" subtitle="run inside AgentHub" />
        <FlowRow icon={<Workflow className="h-4 w-4" />} title="Return" subtitle="get result with clear execution boundary" />
      </div>
    </div>
  );
}

function Node({
  tone,
  label,
}: {
  tone: "rose" | "emerald";
  label: string;
}) {
  const classes =
    tone === "rose"
      ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
      : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";

  return (
    <div className={`rounded-2xl border px-4 py-4 font-mono text-sm ${classes}`}>
      {label}
    </div>
  );
}

function FlowRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-cyan-300">{icon}</div>
      <div>
        <p className="text-sm text-white">{title}</p>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function TerminalLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-cyan-300">{icon}</div>
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </p>
        <p className="truncate text-sm text-zinc-200">{value}</p>
      </div>
    </div>
  );
}

function SignalStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "cyan" | "pink" | "amber" | "emerald";
}) {
  const accentClass =
    color === "cyan"
      ? "border-cyan-400/25 text-cyan-200"
      : color === "pink"
        ? "border-fuchsia-400/25 text-fuchsia-200"
        : color === "amber"
          ? "border-amber-400/25 text-amber-200"
          : "border-emerald-400/25 text-emerald-200";

  return (
    <div className={`rounded-2xl border bg-white/5 p-4 ${accentClass}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function OperatorRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 leading-7 text-zinc-200">{value}</p>
    </div>
  );
}
