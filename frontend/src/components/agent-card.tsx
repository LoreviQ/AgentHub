import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import type { Agent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{agent.name}</CardTitle>
          {agent.verified ? (
            <Badge variant="success">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verified
            </Badge>
          ) : (
            <Badge>Community</Badge>
          )}
        </div>
        <p className="text-sm text-zinc-300">{agent.tagline}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {agent.categories.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
          <Badge variant="trust">{agent.trustLevel}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-300" />
            {agent.avgRating.toFixed(1)} ({agent.totalReviews})
          </span>
          <span>{agent.successRate}% success</span>
          <span>${agent.price}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents/${agent.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
