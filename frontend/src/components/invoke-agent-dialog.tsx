"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Play, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api-client";
import type { AgentDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

function formatOutput(output: unknown): string {
  if (typeof output === "string") {
    return output;
  }

  return JSON.stringify(output, null, 2);
}

export function InvokeAgentDialog({ agent }: { agent: AgentDetail }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(
    agent.example_input ?? "Paste the source text you want this agent to process.",
  );

  const invokeMutation = useMutation({
    mutationFn: () => api.executeAgent({ agentId: agent.id, input: prompt }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-stone-900 text-stone-50 hover:bg-stone-800">
          Run this agent
        </Button>
      </DialogTrigger>
      <DialogContent className="border-stone-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,245,238,0.98))] text-stone-900">
        <h3 className="mb-2 text-xl font-semibold">Run {agent.name}</h3>
        <p className="mb-4 text-sm text-stone-600">
          This uses the same AgentHub execution endpoint external assistants call.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="border-stone-900/10 bg-stone-900/[0.04] text-stone-700">
            {agent.model_provider}
          </Badge>
          <Badge className="border-stone-900/10 bg-stone-900/[0.04] text-stone-700">
            {agent.model_name}
          </Badge>
          <Badge className="border-stone-900/10 bg-stone-900/[0.04] text-stone-700">
            Timeout {agent.runtime_timeout_seconds}s
          </Badge>
          <Badge
            className={
              agent.tools_enabled
                ? "border-amber-700/20 bg-amber-500/10 text-amber-900"
                : "border-emerald-700/20 bg-emerald-500/10 text-emerald-900"
            }
          >
            {agent.tools_enabled ? "Custom tool exposure enabled" : "LLM-only execution"}
          </Badge>
        </div>

        <Textarea
          className="mt-4 min-h-[220px] border-stone-900/10 bg-white text-stone-900 placeholder:text-stone-400"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste the text you want this agent to process..."
        />

        <Button
          className="mt-4 w-full bg-stone-900 text-stone-50 hover:bg-stone-800"
          onClick={() => invokeMutation.mutate()}
          disabled={invokeMutation.isPending}
        >
          {invokeMutation.isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {invokeMutation.isPending
            ? "Executing via AgentHub..."
            : "Execute request"}
        </Button>

        {invokeMutation.isError ? (
          <p className="mt-3 text-sm text-red-700">
            <ShieldAlert className="mr-1 inline h-4 w-4" />
            {invokeMutation.error.message}
          </p>
        ) : null}

        {invokeMutation.data ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-emerald-700/20 bg-emerald-500/8 p-4">
            <p className="font-medium text-emerald-900">Execution complete</p>
            <p className="text-sm text-stone-700">
              Run #{invokeMutation.data.run_id} completed at{" "}
              {new Date(invokeMutation.data.completed_at).toLocaleString()}.
            </p>
            <pre className="overflow-x-auto rounded-xl bg-stone-950 px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-stone-100">
              <code>{formatOutput(invokeMutation.data.output)}</code>
            </pre>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
