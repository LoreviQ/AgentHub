"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Cpu, Search, ShieldCheck, Wrench } from "lucide-react";
import { api } from "@/lib/api-client";
import { AgentCard } from "@/components/agent-card";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [q, setQ] = useState("");
  const deferredQuery = useDeferredValue(q);

  const agentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.listAgents(),
  });

  const visibleAgents =
    agentsQuery.data?.filter((agent) => {
      const haystack = [
        agent.name,
        agent.description,
        agent.model_name,
        agent.output_mode,
        agent.tools_enabled ? "tool-enabled" : "llm-only",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredQuery.trim().toLowerCase());
    }) ?? [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,rgba(254,243,199,0.15)_24%,transparent_48%),radial-gradient(circle_at_top_right,#99f6e4_0%,rgba(153,246,228,0.18)_18%,transparent_42%),linear-gradient(180deg,#faf7f0_0%,#f3efe6_100%)] text-stone-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <Badge className="border-stone-900/10 bg-white/70 text-stone-700">
              MVP Step 7 Demo Website
            </Badge>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
              Browse packaged agents, copy the invocation, and run the real endpoint.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-stone-600">
              This MVP proves the narrow claim that AgentHub can host two
              preconfigured agents, expose them through one execution API, and
              make them easy for a human or another assistant to invoke.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/agents/legal-checker">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-stone-900 px-5 py-3 text-sm font-medium text-stone-50 shadow-[0_16px_40px_rgba(28,25,23,0.15)]">
                  View legal checker
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/agents/clause-extractor">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/80 px-5 py-3 text-sm font-medium text-stone-900">
                  View clause extractor
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[28px] border border-stone-900/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
              <Cpu className="h-6 w-6 text-teal-700" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Shared runtime
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Both agents run through the same platform-owned LLM execution loop.
              </p>
            </div>
            <div className="rounded-[28px] border border-stone-900/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
              <Wrench className="h-6 w-6 text-amber-700" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Optional tools
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                The second agent can selectively call packaged custom tool code.
              </p>
            </div>
            <div className="rounded-[28px] border border-stone-900/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Copyable usage
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Each detail page includes an assistant-ready instruction block and example payloads.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-stone-900/10 bg-white/70 p-5 shadow-[0_24px_80px_rgba(28,25,23,0.08)] md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-stone-500 uppercase">
                Agent directory
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Two demo agents, one execution surface</h2>
            </div>
            <p className="hidden text-sm text-stone-500 md:block">
              Browse the package metadata before you copy the command block.
            </p>
          </div>

          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search by name, model, output mode, or execution type..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border-stone-900/10 bg-white pl-9 text-stone-900 placeholder:text-stone-400 focus-visible:ring-stone-900/30"
            />
          </div>

          {agentsQuery.isLoading ? (
            <p className="text-stone-600">Loading agents...</p>
          ) : null}

          {!agentsQuery.isLoading && visibleAgents.length === 0 ? (
            <p className="text-stone-600">
              No agents matched that search. Try `tool-enabled`, `markdown`, or `gpt-5-mini`.
            </p>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2">
            {visibleAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </section>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-stone-900/10 bg-stone-900 p-6 text-stone-100">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-300">
              Step 1
            </p>
            <p className="mt-3 text-lg font-medium">Pick an agent page.</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              See the model, tool policy, example request, and expected output.
            </p>
          </div>
          <div className="rounded-[28px] border border-stone-900/10 bg-stone-900 p-6 text-stone-100">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-300">
              Step 2
            </p>
            <p className="mt-3 text-lg font-medium">Copy the instruction block.</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Paste it into another assistant so it knows which AgentHub endpoint to call.
            </p>
          </div>
          <div className="rounded-[28px] border border-stone-900/10 bg-stone-900 p-6 text-stone-100">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-300">
              Step 3
            </p>
            <p className="mt-3 text-lg font-medium">Execute the packaged runtime.</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              AgentHub runs the selected package on the backend and returns the result.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
