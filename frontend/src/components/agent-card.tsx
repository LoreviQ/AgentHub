import Link from "next/link";
import { ArrowRight, Bot, Coins, Lock, Sparkles, Star, Wrench } from "lucide-react";
import type { MarketplaceAgentProfile } from "@/lib/marketplace-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const accentStyles: Record<MarketplaceAgentProfile["accent"], string> = {
  cyan: "border-cyan-400/25 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_42px_rgba(34,211,238,0.08)]",
  pink: "border-fuchsia-400/25 shadow-[0_0_0_1px_rgba(232,121,249,0.08),0_0_42px_rgba(232,121,249,0.08)]",
  amber: "border-amber-400/25 shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_0_42px_rgba(251,191,36,0.08)]",
  violet: "border-violet-400/25 shadow-[0_0_0_1px_rgba(167,139,250,0.08),0_0_42px_rgba(167,139,250,0.08)]",
  emerald:
    "border-emerald-400/25 shadow-[0_0_0_1px_rgba(52,211,153,0.08),0_0_42px_rgba(52,211,153,0.08)]",
};

export function AgentCard({ agent }: { agent: MarketplaceAgentProfile }) {
  return (
    <Card
      className={`group overflow-hidden bg-[#090312]/90 transition duration-300 hover:-translate-y-1 ${accentStyles[agent.accent]}`}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              {agent.id}
            </p>
            <CardTitle className="mt-2 text-2xl text-white">
              {agent.name}
            </CardTitle>
          </div>
          <Badge
            className={
              agent.source === "live"
                ? "border-emerald-400/30 bg-emerald-500/10 font-mono text-emerald-300"
                : "border-fuchsia-400/30 bg-fuchsia-500/10 font-mono text-fuchsia-300"
            }
          >
            {agent.source === "live" ? (
              <Sparkles className="mr-1 h-3 w-3" />
            ) : (
              <Lock className="mr-1 h-3 w-3" />
            )}
            {agent.statusLabel}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-zinc-300">{agent.tagline}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-stone-900/10 bg-stone-900/[0.03] text-stone-700">
            {agent.categories[0]}
          </Badge>
          <Badge className="border-white/10 bg-white/5 font-mono text-zinc-300">
            {agent.trustLabel}
          </Badge>
          <Badge className="border-white/10 bg-white/5 font-mono text-zinc-300">
            {agent.runCountLabel}
          </Badge>
          <Badge className="border-white/10 bg-white/5 font-mono text-zinc-300">
            {agent.source === "live" ? (
              <>
                <Bot className="mr-1 h-3 w-3" />
                Real endpoint
              </>
            ) : (
              <>
                <Wrench className="mr-1 h-3 w-3" />
                Mock listing
              </>
            )}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-zinc-400">{agent.description}</p>
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Rating
            </p>
            <p className="inline-flex items-center gap-1 text-white">
              <Star className="h-4 w-4 text-amber-300" />
              {agent.rating.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Cost
            </p>
            <p className="inline-flex items-center gap-1 text-white">
              <Coins className="h-4 w-4 text-cyan-300" />
              {agent.priceValue}
            </p>
          </div>
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Creator
            </p>
            <p className="truncate text-white">{agent.creatorHandle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents/${agent.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-white/15 bg-white/5 font-mono text-white hover:bg-white/10"
            >
              Open listing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
