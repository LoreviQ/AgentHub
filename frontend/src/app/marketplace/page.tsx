"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { AgentCard } from "@/components/agent-card";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buildLiveMarketplaceProfile, displayOnlyAgents, type MarketplaceAgentProfile } from "@/lib/marketplace-content";

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const liveAgentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.listAgents(),
  });

  const agents = useMemo(() => {
    const liveProfiles =
      liveAgentsQuery.data?.map((agent) => buildLiveMarketplaceProfile(agent)) ?? [];
    return [...liveProfiles, ...displayOnlyAgents];
  }, [liveAgentsQuery.data]);

  const filteredAgents = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return agents;

    return agents.filter((agent) =>
      [
        agent.name,
        agent.tagline,
        agent.description,
        agent.creatorHandle,
        agent.categories.join(" "),
        agent.statusLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [agents, deferredQuery]);

  const liveCount = agents.filter((agent) => agent.source === "live").length;
  const displayOnlyCount = agents.filter(
    (agent) => agent.source === "display-only",
  ).length;

  return (
    <div className="min-h-screen text-zinc-100">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-8 rounded-[34px] border border-cyan-400/20 bg-[#090312]/92 p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                Marketplace
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
                Browse specialist agents.
              </h1>
              <p className="mt-4 max-w-3xl leading-8 text-zinc-300">
                Explore curated agent listings, inspect what each specialist
                does, and jump into a live listing to test the runtime through
                the website.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-emerald-400/30 bg-emerald-500/10 font-mono text-emerald-300">
                {liveCount} live
              </Badge>
              <Badge className="border-fuchsia-400/30 bg-fuchsia-500/10 font-mono text-fuchsia-300">
                {displayOnlyCount} preview
              </Badge>
            </div>
          </div>
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-cyan-200/40" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search legal, security, web3, extraction, negotiation..."
              className="border-cyan-400/20 bg-black/30 pl-9 font-mono text-cyan-50 placeholder:text-cyan-100/30 focus-visible:ring-cyan-400/40"
            />
          </div>
        </section>

        {liveAgentsQuery.isLoading ? (
          <p className="font-mono text-zinc-400">Loading marketplace feed...</p>
        ) : null}

        {filteredAgents.length === 0 ? (
          <p className="font-mono text-zinc-400">No listings matched that search.</p>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent: MarketplaceAgentProfile) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </section>
      </main>
    </div>
  );
}
