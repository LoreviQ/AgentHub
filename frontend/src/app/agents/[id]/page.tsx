"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock3, Cpu, Globe, Package, Wrench } from "lucide-react";
import { api } from "@/lib/api-client";
import { CopyCommandBlock } from "@/components/copy-command-block";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvokeAgentDialog } from "@/components/invoke-agent-dialog";

function formatExampleOutput(output: unknown, raw: string | null): string {
  if (raw) {
    return raw;
  }
  if (output == null) {
    return "No example response available.";
  }
  if (typeof output === "string") {
    return output;
  }
  return JSON.stringify(output, null, 2);
}

export default function AgentDetailsPage() {
  const params = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["agent", params.id],
    queryFn: () => api.getAgent(params.id),
  });

  const agent = query.data;
  if (query.isLoading) {
    return <div className="p-8 text-stone-700">Loading agent details...</div>;
  }
  if (!agent) return <div className="p-8 text-stone-700">Agent not found.</div>;

  const endpointPath = `/api/agents/${agent.id}/execute`;
  const sampleInput = agent.example_input ?? "<document text>";
  const bodyJson = JSON.stringify({ input: sampleInput }, null, 2);
  const assistantInstruction = [
    `Use the AgentHub execution endpoint for ${agent.name}.`,
    `POST ${endpointPath}`,
    "Content-Type: application/json",
    "",
    "Body:",
    bodyJson,
    "",
    "Return the API response output to the user without changing its structure.",
  ].join("\n");
  const curlCommand = [
    `curl -X POST "$AGENTHUB_URL${endpointPath}" \\`,
    '  -H "Content-Type: application/json" \\',
    `  -d '${JSON.stringify({ input: sampleInput })}'`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,rgba(254,243,199,0.15)_24%,transparent_48%),radial-gradient(circle_at_top_right,#99f6e4_0%,rgba(153,246,228,0.18)_18%,transparent_42%),linear-gradient(180deg,#faf7f0_0%,#f3efe6_100%)] text-stone-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to demo site
        </Link>

        <section className="rounded-[36px] border border-stone-900/10 bg-white/80 p-6 shadow-[0_30px_100px_rgba(28,25,23,0.08)] md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                {agent.id}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                {agent.name}
              </h1>
              <p className="mt-4 text-lg leading-8 text-stone-600">
                {agent.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="border-stone-900/10 bg-stone-900/[0.04] text-stone-700">
                  Version {agent.version}
                </Badge>
                <Badge className="border-stone-900/10 bg-stone-900/[0.04] text-stone-700">
                  {agent.model_provider}
                </Badge>
                <Badge className="border-stone-900/10 bg-stone-900/[0.04] text-stone-700">
                  {agent.model_name}
                </Badge>
                <Badge
                  className={
                    agent.tools_enabled
                      ? "border-amber-700/20 bg-amber-500/10 text-amber-900"
                      : "border-emerald-700/20 bg-emerald-500/10 text-emerald-900"
                  }
                >
                  {agent.tools_enabled ? "Tool-enabled runtime" : "LLM-only runtime"}
                </Badge>
              </div>
            </div>
            <InvokeAgentDialog agent={agent} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <Cpu className="h-5 w-5 text-teal-700" />
                Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-stone-600">
              <p>{agent.model_provider}</p>
              <p>{agent.model_name}</p>
              <p>Temperature {agent.model_temperature}</p>
              <p>Max tokens {agent.model_max_tokens}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <Clock3 className="h-5 w-5 text-amber-700" />
                Runtime
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-stone-600">
              <p>Timeout {agent.runtime_timeout_seconds}s</p>
              <p>Input mode {agent.input_mode}</p>
              <p>Output mode {agent.output_mode}</p>
              <p>{agent.runtime_execution_notes ?? "No execution notes recorded."}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <Globe className="h-5 w-5 text-emerald-700" />
                Network policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-stone-600">
              <p>
                Internet access{" "}
                {agent.runtime_internet_access ? "enabled" : "disabled"}
              </p>
              <p>
                Shared platform endpoint: <span className="font-medium text-stone-900">{endpointPath}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <Package className="h-5 w-5 text-stone-700" />
                Package files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-stone-600">
              <p>{agent.package_path}</p>
              <p>{agent.example_input_path ?? "No example input file"}</p>
              <p>{agent.example_output_path ?? "No example output file"}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <CopyCommandBlock
              title="Assistant Invocation"
              description="Paste this into another assistant so it knows exactly which AgentHub endpoint to call."
              code={assistantInstruction}
            />
            <CopyCommandBlock
              title="cURL Example"
              description="A copyable command block for direct HTTP invocation."
              code={curlCommand}
            />
          </div>

          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-stone-900">Public usage instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-2xl bg-stone-950 px-4 py-4 text-sm leading-6 whitespace-pre-wrap text-stone-100">
                <code>{agent.public_instructions}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-stone-900">Example request</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-2xl bg-stone-950 px-4 py-4 text-sm leading-6 whitespace-pre-wrap text-stone-100">
                <code>{agent.example_input ?? "No example request available."}</code>
              </pre>
            </CardContent>
          </Card>
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-stone-900">Example response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-2xl bg-stone-950 px-4 py-4 text-sm leading-6 whitespace-pre-wrap text-stone-100">
                <code>
                  {formatExampleOutput(agent.example_output, agent.example_output_raw)}
                </code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-stone-900">Packaged instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-2xl bg-stone-950 px-4 py-4 text-sm leading-6 whitespace-pre-wrap text-stone-100">
                <code>{agent.instructions_markdown}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="border-stone-900/10 bg-white/80">
            <CardHeader>
              <CardTitle className="text-stone-900">
                {agent.tools_enabled ? "Declared tools" : "Execution shape"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.tools.length === 0 ? (
                <div className="rounded-2xl border border-emerald-700/20 bg-emerald-500/8 p-4 text-sm leading-6 text-stone-700">
                  <p className="font-medium text-emerald-900">LLM-only agent</p>
                  <p className="mt-1">
                    This package relies only on its prompt, model selection, and the shared AgentHub runtime.
                  </p>
                </div>
              ) : (
                agent.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-2xl border border-stone-900/10 bg-stone-900/[0.03] p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-amber-700" />
                      <p className="font-medium text-stone-900">{tool.name}</p>
                    </div>
                    <p className="text-sm leading-6 text-stone-600">
                      {tool.description}
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-stone-600">
                      <p>Image: {tool.image}</p>
                      <p>Entrypoint: {tool.entrypoint}</p>
                      <p>
                        Contract: {tool.input_format} in, {tool.output_format} out
                      </p>
                      <p>Timeout: {tool.timeout_seconds}s</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
