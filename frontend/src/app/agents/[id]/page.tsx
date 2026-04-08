"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Coins, Copy, Cpu, Package, ShieldCheck, Sparkles, Star, Wrench } from "lucide-react";
import { api } from "@/lib/api-client";
import { AgentChatPanel } from "@/components/agent-chat-panel";
import { CopyCommandBlock } from "@/components/copy-command-block";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildLiveMarketplaceProfile,
  getCatalogAgentIds,
  getDisplayOnlyAgent,
  type MarketplaceAgentProfile,
} from "@/lib/marketplace-content";

function prettyJson(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

export default function AgentDetailsPage() {
  const params = useParams<{ id: string }>();
  const isKnown = getCatalogAgentIds().includes(params.id);

  const liveAgentQuery = useQuery({
    queryKey: ["agent", params.id],
    queryFn: () => api.getAgent(params.id),
    enabled: params.id === "legal-checker" || params.id === "clause-extractor",
  });

  if (!isKnown) {
    return (
      <div className="min-h-screen text-zinc-100">
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <Card className="border-rose-400/20 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="text-white">Listing not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-zinc-300">
              <p>This marketplace listing does not exist in the demo catalog.</p>
              <Link
                href="/marketplace"
                className="font-mono text-cyan-300 hover:text-cyan-100"
              >
                Return to marketplace →
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const detail = liveAgentQuery.data;
  const mockProfile = getDisplayOnlyAgent(params.id);
  const profile: MarketplaceAgentProfile | undefined =
    detail != null
      ? buildLiveMarketplaceProfile(detail, detail)
      : mockProfile;

  if ((params.id === "legal-checker" || params.id === "clause-extractor") && liveAgentQuery.isLoading) {
    return <div className="p-8 font-mono text-zinc-300">Loading agent listing...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen text-zinc-100">
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <Card className="border-rose-400/20 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="text-white">Agent details unavailable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-zinc-300">
              <p>
                This listing exists, but its detail payload could not be loaded
                right now.
              </p>
              <Link
                href="/marketplace"
                className="font-mono text-cyan-300 hover:text-cyan-100"
              >
                Return to marketplace →
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const stubbedEndpoint = `https://agenthub.example/api/agents/${profile.id}/execute`;
  const copyBlock = profile.source === "live"
    ? [
        `When a user needs ${profile.name}, call the AgentHub marketplace specialist endpoint.`,
        `Use POST ${stubbedEndpoint}`,
        'Send JSON as: { "input": "<user text or document excerpt>" }',
        "Use this agent when the task matches its specialty and you want a packaged third-party-style agent rather than a general answer.",
        "Return the output clearly, and mention that AgentHub executed the specialist on the platform runtime.",
      ].join("\n")
    : [
        `${profile.name} is currently a display-only marketplace listing in the demo.`,
        "Do not attempt to call it yet.",
        "Treat it as a preview of how future creator agents will appear once open publishing is supported.",
      ].join("\n");

  const exampleRequest = prettyJson(profile.sampleRequestBody);
  const exampleResponse = prettyJson(profile.sampleResponse);

  return (
    <div className="min-h-screen text-zinc-100">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 md:py-10">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 font-mono text-sm text-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>

        <section className="neon-frame overflow-hidden rounded-[36px] bg-[#090312]/92 p-7">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  profile.source === "live"
                    ? "border-emerald-400/30 bg-emerald-500/10 font-mono text-emerald-300"
                    : "border-fuchsia-400/30 bg-fuchsia-500/10 font-mono text-fuchsia-300"
                }
              >
                {profile.statusLabel}
              </Badge>
              <Badge className="border-cyan-400/20 bg-cyan-400/10 font-mono text-cyan-200">
                {profile.creatorHandle}
              </Badge>
              <Badge className="border-white/10 bg-white/5 font-mono text-zinc-300">
                {profile.trustLabel}
              </Badge>
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-4 text-xl text-cyan-100/90">{profile.tagline}</p>
            <p className="mt-5 max-w-4xl leading-8 text-zinc-300">
              {profile.longDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.categories.map((category) => (
                <Badge
                  key={category}
                  className="border-white/10 bg-white/5 font-mono text-zinc-300"
                >
                  {category}
                </Badge>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={<Star className="h-5 w-5 text-amber-300" />} label="Rating" value={`${profile.rating.toFixed(1)} / 5`} />
              <MetricCard icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />} label="Reviews" value={`${profile.reviewCount}`} />
              <MetricCard icon={<Coins className="h-5 w-5 text-cyan-300" />} label={profile.priceLabel} value={profile.priceValue} />
              <MetricCard icon={<Sparkles className="h-5 w-5 text-fuchsia-300" />} label="Usage" value={profile.runCountLabel} />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <Card className="border-cyan-400/15 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-cyan-300" />
                What it does
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-7 text-zinc-300">
              <p>{profile.description}</p>
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Best for
                </p>
                <ul className="space-y-2">
                  {profile.useCases.map((useCase) => (
                    <li key={useCase}>• {useCase}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-fuchsia-400/15 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wrench className="h-5 w-5 text-fuchsia-300" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-7 text-zinc-300">
              <p>{profile.whyThisExists}</p>
              <ul className="space-y-2">
                {profile.howItWorks.map((step) => (
                  <li key={step}>• {step}</li>
                ))}
              </ul>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Runtime summary
                </p>
                <p className="mt-2 text-zinc-300">
                  {detail
                    ? `${detail.model_provider}/${detail.model_name} • ${detail.output_mode} output • timeout ${detail.runtime_timeout_seconds}s`
                    : profile.toolSummary}
                </p>
              </div>
            </CardContent>
          </Card>

          <AgentChatPanel profile={profile} detail={detail} />
        </section>

        <section className="space-y-6">
          <CopyCommandBlock
            title="Copy for your personal assistant"
            description="This is intentionally stubbed because the backend is not public-user-facing yet."
            code={copyBlock}
          />
          <Card className="border-amber-400/15 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Copy className="h-5 w-5 text-amber-300" />
                Cost and marketplace notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-7 text-zinc-300">
              <p>
                <span className="text-white">{profile.priceLabel}:</span>{" "}
                {profile.priceValue}
              </p>
              <p>{profile.costBlurb}</p>
              <p>
                <span className="text-white">Listing status:</span>{" "}
                {profile.source === "live"
                  ? "Curated live demo agent. This one actually executes."
                  : profile.displayOnlyReason}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="border-cyan-400/15 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="text-white">Example request</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-sm leading-6 text-cyan-100">
                <code>{exampleRequest}</code>
              </pre>
            </CardContent>
          </Card>
          <Card className="border-fuchsia-400/15 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="text-white">Example response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-sm leading-6 text-fuchsia-100">
                <code>{exampleResponse}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="border-white/10 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5 text-cyan-300" />
                Agent details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-zinc-300">
              {detail ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Public instructions
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-6 text-zinc-200">
                      <code>{detail.public_instructions}</code>
                    </pre>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Packaged instructions
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-6 text-zinc-200">
                      <code>{detail.instructions_markdown}</code>
                    </pre>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 leading-7">
                  <p>{profile.toolSummary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#090312]/92">
            <CardHeader>
              <CardTitle className="text-white">Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.reviews.map((review) => (
                <div
                  key={`${review.author}-${review.quote}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white">{review.author}</p>
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                        {review.role}
                      </p>
                    </div>
                    <Badge className="border-amber-400/30 bg-amber-500/10 font-mono text-amber-300">
                      {review.rating.toFixed(1)} / 5
                    </Badge>
                  </div>
                  <p className="leading-7 text-zinc-300">{review.quote}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 text-center">
      <div className="mb-3 inline-flex w-full items-center justify-center gap-2 text-zinc-300">
        {icon}
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold text-white md:text-3xl">{value}</p>
    </div>
  );
}
