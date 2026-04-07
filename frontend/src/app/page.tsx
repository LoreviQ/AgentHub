"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { AgentCard } from "@/components/agent-card";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [trust, setTrust] = useState("all");
  const [permissionRisk, setPermissionRisk] = useState("all");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    if (trust !== "all") params.set("trust", trust);
    if (permissionRisk !== "all") params.set("permissionRisk", permissionRisk);
    return params.toString();
  }, [q, category, trust, permissionRisk]);

  const agentsQuery = useQuery({
    queryKey: ["agents", query],
    queryFn: () => api.listAgents(query),
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="mb-8 space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            Trusted Agent Marketplace
          </h1>
          <p className="max-w-3xl text-zinc-400">
            Discover specialist agents and invoke them in secure, ephemeral
            environments with explicit permission approvals and auditable runs.
          </p>
        </section>

        <section className="mb-8 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by capability, category, or name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="Strategy">Strategy</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select value={trust} onValueChange={setTrust}>
              <SelectTrigger>
                <SelectValue placeholder="Trust" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any trust</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={permissionRisk} onValueChange={setPermissionRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Permission risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any risk</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {agentsQuery.isLoading ? <p>Loading agents...</p> : null}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentsQuery.data?.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </section>
      </main>
    </div>
  );
}
