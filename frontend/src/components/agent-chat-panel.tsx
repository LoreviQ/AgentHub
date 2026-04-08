"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, LoaderCircle, Lock, Play, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import type { MarketplaceAgentProfile } from "@/lib/marketplace-content";
import type { AgentDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

function formatOutput(output: unknown): string {
  if (typeof output === "string") {
    return output;
  }

  return JSON.stringify(output, null, 2);
}

export function AgentChatPanel({
  profile,
  detail,
}: {
  profile: MarketplaceAgentProfile;
  detail?: AgentDetail;
}) {
  const [prompt, setPrompt] = useState(
    detail?.example_input ?? profile.examplePrompt,
  );

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (profile.source !== "live") {
        throw new Error("This listing is display-only in the demo.");
      }

      return api.executeAgent({ agentId: profile.id, input: prompt });
    },
  });

  const isLive = profile.source === "live";

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/30 bg-[#090312]/95 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_38px_rgba(34,211,238,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.14),transparent_35%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Live test panel
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Chat with {profile.name}
            </h3>
          </div>
          <Badge
            className={
              isLive
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                : "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300"
            }
          >
            {isLive ? "Live executable" : "Display only"}
          </Badge>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          <div className="mb-2 flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.24em]">
              Suggested input
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-zinc-200">
            <code>{detail?.example_input ?? profile.examplePrompt}</code>
          </pre>
        </div>

        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-h-[220px] border-cyan-400/20 bg-black/30 font-mono text-cyan-50 placeholder:text-cyan-100/30 focus-visible:ring-cyan-400/40"
          placeholder="Paste the text you want this agent to process..."
        />

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={() => executeMutation.mutate()}
            disabled={executeMutation.isPending || !isLive}
            className="border border-cyan-400/40 bg-cyan-400/15 font-mono text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.14)] hover:bg-cyan-400/25"
          >
            {isLive ? (
              executeMutation.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {isLive ? "Run live test" : "Unavailable in Demo"}
          </Button>
          <p className="text-sm text-zinc-400">
            {isLive
              ? "Only the two curated demo agents execute for real."
              : profile.displayOnlyReason}
          </p>
        </div>

        {executeMutation.isError ? (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {executeMutation.error.message}
          </div>
        ) : null}

        {executeMutation.data ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-300">
              <Bot className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-[0.24em]">
                Agent response
              </span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 font-mono text-sm leading-6 text-emerald-100">
              <code>{formatOutput(executeMutation.data.output)}</code>
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
