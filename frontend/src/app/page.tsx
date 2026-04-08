"use client";

import Link from "next/link";
import { ArrowRight, Boxes, Code2, Cpu, GitBranch, Lock, Orbit, Sparkles, TerminalSquare, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const repoUrl = process.env.NEXT_PUBLIC_GIT_REPO_URL;

export default function Home() {
  return (
    <div className="min-h-screen text-zinc-100">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-cyan-400/15">
          <div className="scan-grid absolute inset-0 opacity-30" />
          <div className="absolute left-[8%] top-28 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-[12%] top-40 h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="mx-auto grid min-h-[78vh] w-full max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative z-10">
              <Badge className="border-cyan-400/35 bg-cyan-400/10 font-mono text-cyan-200">
                Marketplace MVP / curated launch slice
              </Badge>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
                AgentHub is the neon storefront for specialist agents.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                This MVP is a marketplace demo, not a full marketplace yet. Two
                agents are actually executable through the platform runtime.
                The rest are clearly labeled display-only listings so the
                marketplace feels real while staying honest about scope.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/marketplace">
                  <Button className="border border-cyan-400/35 bg-cyan-400/12 font-mono text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)] hover:bg-cyan-400/20">
                    Browse marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/creator/publish">
                  <Button className="border border-fuchsia-400/35 bg-fuchsia-500/12 font-mono text-fuchsia-100 hover:bg-fuchsia-500/18">
                    Create agent concept
                  </Button>
                </Link>
                {repoUrl ? (
                  <a href={repoUrl} target="_blank" rel="noreferrer">
                    <Button className="border border-white/15 bg-white/5 font-mono text-white hover:bg-white/10">
                      <GitBranch className="mr-2 h-4 w-4" />
                      Git repo
                    </Button>
                  </a>
                ) : (
                  <Button
                    disabled
                    className="border border-white/10 bg-white/5 font-mono text-zinc-500"
                  >
                    <GitBranch className="mr-2 h-4 w-4" />
                    Repo URL via `NEXT_PUBLIC_GIT_REPO_URL`
                  </Button>
                )}
              </div>
            </div>

            <div className="relative z-10">
              <div className="neon-frame pulse-glow rounded-[34px] bg-[#090312]/92 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                    Runtime feed
                  </p>
                  <Badge className="border-emerald-400/30 bg-emerald-500/10 font-mono text-emerald-300">
                    2 live
                  </Badge>
                </div>
                <div className="space-y-4">
                  <TerminalLine icon={<Cpu className="h-4 w-4" />} label="shared-runtime" value="platform controlled / pydantic-ai / openrouter" />
                  <TerminalLine icon={<Wrench className="h-4 w-4" />} label="tool-jobs" value="short-lived container execution for approved tools" />
                  <TerminalLine icon={<Boxes className="h-4 w-4" />} label="packages" value="agent.md + agent.yaml + examples + optional tool image" />
                  <TerminalLine icon={<Lock className="h-4 w-4" />} label="marketplace-state" value="2 live agents + display-only listings for MVP story" />
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <NeonStat label="Live agents" value="02" accent="cyan" />
                  <NeonStat label="Display listings" value="03" accent="pink" />
                  <NeonStat label="Execution path" value="01" accent="amber" />
                  <NeonStat label="Marketplace vibes" value="MAX" accent="emerald" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Why this exists
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              A marketplace demo that proves the runtime first.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <StoryCard
              icon={<Orbit className="h-5 w-5 text-cyan-300" />}
              title="Curated, not open"
              text="This MVP is intentionally narrow. We preload agents ourselves to prove packaging, execution, and invocation before creator onboarding exists."
            />
            <StoryCard
              icon={<Code2 className="h-5 w-5 text-fuchsia-300" />}
              title="Developer legible"
              text="The product story is aimed at builders: package contracts, model metadata, tool policy, example payloads, and invocation instructions are all visible."
            />
            <StoryCard
              icon={<Sparkles className="h-5 w-5 text-amber-300" />}
              title="Assistant-to-agent ready"
              text="Every real listing includes copyable text that another assistant can use to understand when and how to delegate to that specialist."
            />
          </div>
        </section>

        <section className="border-y border-fuchsia-400/15 bg-[linear-gradient(180deg,rgba(9,3,18,0.95),rgba(4,1,10,0.98))]">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-16 lg:grid-cols-2">
            <Cutout
              title="What counts as real in this MVP?"
              eyebrow="Honest scope"
              accent="cyan"
              body="Only the Legal Document Concern Checker and Clause Extractor Assistant are wired to the backend execution API. Additional listings are frontend-only and tagged display-only so the marketplace can show future shape without overclaiming functionality."
            />
            <Cutout
              title="What should a developer notice?"
              eyebrow="Dev focused"
              accent="pink"
              body="You can inspect packaged instructions, runtime metadata, example payloads, and a stubbed assistant-invocation block. The UI is deliberately readable to technical users evaluating whether the platform model feels credible."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                Build flow
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                From package to marketplace listing
              </h2>
            </div>
            <Link href="/marketplace" className="font-mono text-sm text-cyan-300 hover:text-cyan-100">
              Open the market →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StepCard step="01" title="Package" text="Creator bundle contains `agent.md`, `agent.yaml`, examples, and optional tool code." />
            <StepCard step="02" title="Register" text="Backend validates package shape and syncs metadata into the AgentHub registry." />
            <StepCard step="03" title="List" text="Marketplace renders curated live agents plus display-only concept listings." />
            <StepCard step="04" title="Invoke" text="Another assistant or human copies the instruction block and hits the execution endpoint." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="neon-frame rounded-[34px] bg-[#090312]/92 p-7">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-fuchsia-300/80">
                  Dev kit
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  Built for founders, infra nerds, and agent tinkerers.
                </h2>
                <p className="mt-4 max-w-2xl leading-8 text-zinc-300">
                  The homepage is intentionally long-form because the landing
                  page needs to explain the product thesis, not just dump users
                  into cards. This is the “why”, the “how”, and the “show me the
                  goods” layer for a technical audience.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                <div className="mb-4 flex items-center gap-2 text-cyan-300">
                  <TerminalSquare className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-[0.24em]">
                    Quick links
                  </span>
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <QuickLink href="/marketplace" label="Marketplace listings" />
                  <QuickLink href="/agents/legal-checker" label="Live agent: legal-checker" />
                  <QuickLink href="/agents/clause-extractor" label="Live agent: clause-extractor" />
                  <QuickLink href="/creator/publish" label="Visual-only create agent page" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
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

function NeonStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "pink" | "amber" | "emerald";
}) {
  const accentClass =
    accent === "cyan"
      ? "border-cyan-400/25 text-cyan-200"
      : accent === "pink"
        ? "border-fuchsia-400/25 text-fuchsia-200"
        : accent === "amber"
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

function StoryCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="neon-frame rounded-[28px] bg-[#090312]/92 p-6">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-zinc-300">{text}</p>
    </div>
  );
}

function Cutout({
  eyebrow,
  title,
  body,
  accent,
}: {
  eyebrow: string;
  title: string;
  body: string;
  accent: "cyan" | "pink";
}) {
  const accentClass =
    accent === "cyan"
      ? "border-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
      : "border-fuchsia-400/20 shadow-[0_0_30px_rgba(232,121,249,0.08)]";

  return (
    <div className={`rounded-[30px] border bg-white/5 p-6 ${accentClass}`}>
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-4 leading-8 text-zinc-300">{body}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
        {step}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-zinc-300">{text}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-200 hover:border-cyan-400/25 hover:text-white"
    >
      {label}
    </Link>
  );
}
