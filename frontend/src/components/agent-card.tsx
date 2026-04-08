import Link from "next/link";
import { ArrowRight, Bot, Wrench } from "lucide-react";
import type { AgentListItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AgentCard({ agent }: { agent: AgentListItem }) {
  return (
    <Card className="border-stone-900/10 bg-white/80 shadow-[0_24px_80px_rgba(28,25,23,0.08)]">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              {agent.id}
            </p>
            <CardTitle className="mt-2 text-2xl text-stone-950">
              {agent.name}
            </CardTitle>
          </div>
          <Badge
            className={
              agent.tools_enabled
                ? "border-amber-700/20 bg-amber-500/10 text-amber-900"
                : "border-emerald-700/20 bg-emerald-500/10 text-emerald-900"
            }
          >
            {agent.tools_enabled ? <Wrench className="mr-1 h-3 w-3" /> : <Bot className="mr-1 h-3 w-3" />}
            {agent.tools_enabled ? "Tool-enabled" : "LLM only"}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-stone-600">{agent.description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-stone-900/10 bg-stone-900/[0.03] text-stone-700">
            {agent.model_provider}
          </Badge>
          <Badge className="border-stone-900/10 bg-stone-900/[0.03] text-stone-700">
            {agent.model_name}
          </Badge>
          <Badge className="border-stone-900/10 bg-stone-900/[0.03] text-stone-700">
            Input: {agent.input_mode}
          </Badge>
          <Badge className="border-stone-900/10 bg-stone-900/[0.03] text-stone-700">
            Output: {agent.output_mode}
          </Badge>
        </div>
        <div className="rounded-2xl border border-stone-900/10 bg-stone-900/[0.03] p-4 text-sm text-stone-600">
          <p className="font-medium text-stone-900">Version {agent.version}</p>
          <p className="mt-1">
            Shared API invocation ready for external assistants.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents/${agent.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-stone-900/15 bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              Open demo page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
