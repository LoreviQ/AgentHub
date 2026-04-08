import Link from "next/link";
import { ArrowRight, Boxes, Cpu, Lock, Wand2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldRows = [
  ["Agent name", "Zero-Knowledge Due Diligence Scout"],
  ["Tagline", "Scans investor decks, risk memos, and governance docs"],
  ["Category", "Research / Compliance / Web3"],
  ["Runtime", "python3.12 + packaged tools"],
  ["Model", "openrouter/openai/gpt-5-mini"],
  ["Price", "$0.18 / run"],
];

export default function PublishPage() {
  return (
    <div className="min-h-screen text-zinc-100">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-8 rounded-[36px] border border-fuchsia-400/20 bg-[#090312]/92 p-7 shadow-[0_0_60px_rgba(232,121,249,0.08)]">
          <Badge className="border-fuchsia-400/30 bg-fuchsia-500/10 font-mono text-fuchsia-300">
            Visual only / non-functional
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">
            Create agent listing
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-zinc-300">
            This page is intentionally a concept page for the MVP. It shows
            what creator onboarding could feel like later, but it does not
            submit anything yet. Right now the marketplace is curated.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="neon-frame rounded-[32px] bg-[#090312]/92 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Wand2 className="h-5 w-5 text-fuchsia-300" />
              <h2 className="text-2xl font-semibold text-white">
                Creator package builder
              </h2>
            </div>

            <div className="space-y-3">
              {fieldRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[180px_1fr]"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                    {label}
                  </p>
                  <p className="font-mono text-zinc-200">{value}</p>
                </div>
              ))}
              <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/8 p-4 text-sm leading-7 text-cyan-100">
                Future version: upload package files, validate `agent.yaml`,
                build tool image references, and submit for review.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-cyan-400/20 bg-[#090312]/92 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Boxes className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl font-semibold text-white">
                  What creators will eventually do
                </h2>
              </div>
              <ul className="space-y-3 leading-7 text-zinc-300">
                <li>• Package instructions, config, examples, and optional tools.</li>
                <li>• Preview how the listing appears in the marketplace.</li>
                <li>• Publish specialist agents with transparent runtime notes.</li>
                <li>• Offer pricing, reviews, and category metadata.</li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-amber-400/20 bg-[#090312]/92 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Lock className="h-5 w-5 text-amber-300" />
                <h2 className="text-2xl font-semibold text-white">
                  Why this page is fake for now
                </h2>
              </div>
              <p className="leading-8 text-zinc-300">
                The MVP goal is to prove execution and invocation, not creator
                onboarding. So this screen exists purely as product storytelling
                and visual direction for the future marketplace flow.
              </p>
            </div>

            <div className="rounded-[32px] border border-emerald-400/20 bg-[#090312]/92 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Cpu className="h-5 w-5 text-emerald-300" />
                <h2 className="text-2xl font-semibold text-white">
                  Ready now
                </h2>
              </div>
              <p className="leading-8 text-zinc-300">
                The runtime is real for the two demo agents. The public creator
                submission surface comes later.
              </p>
              <Link
                href="/marketplace"
                className={cn(
                  buttonVariants(),
                  "mt-4 border border-white/15 bg-white/5 font-mono text-white hover:bg-white/10",
                )}
              >
                Back to live marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
