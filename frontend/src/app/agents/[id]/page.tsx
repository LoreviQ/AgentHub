"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvokeAgentDialog } from "@/components/invoke-agent-dialog";

export default function AgentDetailsPage() {
  const params = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["agent", params.id],
    queryFn: () => api.getAgent(params.id),
  });

  const agent = query.data;
  if (query.isLoading) return <div className="p-8">Loading...</div>;
  if (!agent) return <div className="p-8">Agent not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to marketplace
        </Link>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-semibold">{agent.name}</h1>
            <p className="mt-2 text-zinc-400">{agent.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.categories.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
              <Badge variant="trust">{agent.trustLevel}</Badge>
              {agent.verified && (
                <Badge variant="success">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <InvokeAgentDialog agent={agent} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Permissions Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agent.permissions.map((permission) => (
                <div key={permission.id} className="rounded-lg border border-zinc-800 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-medium">{permission.name}</p>
                    <Badge
                      variant={
                        permission.risk === "high"
                          ? "danger"
                          : permission.risk === "medium"
                            ? "warning"
                            : "success"
                      }
                    >
                      {permission.risk}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400">{permission.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Execution & Trust Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <p>Price: ${agent.price} ({agent.priceModel})</p>
              <p>Runs: {agent.totalRuns}</p>
              <p>Success rate: {agent.successRate}%</p>
              <p>Rating: {agent.avgRating.toFixed(1)} ({agent.totalReviews} reviews)</p>
              <p>Owner: {agent.owner}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
