import Link from "next/link";
import { Boxes, ChevronRight, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan-400/15 bg-[#06010d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-cyan-100 uppercase"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
            <Shield className="h-4 w-4" />
          </span>
          AgentHub
        </Link>
        <nav className="hidden items-center gap-6 font-mono text-sm text-zinc-300 md:flex">
          <Link href="/marketplace" className="transition hover:text-cyan-200">
            Marketplace
          </Link>
          <Link href="/creator/publish" className="transition hover:text-fuchsia-200">
            Create Agent
          </Link>
          <Link href="/dashboard" className="transition hover:text-amber-200">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <Badge className="hidden border-emerald-400/30 bg-emerald-500/10 font-mono text-emerald-300 sm:inline-flex">
            <Boxes className="mr-1 h-3 w-3" />
            2 live / 3 display only
          </Badge>
          <Link href="/marketplace">
            <Button className="border border-cyan-400/35 bg-cyan-400/10 font-mono text-cyan-100 hover:bg-cyan-400/20">
              <Sparkles className="mr-2 h-4 w-4" />
              Enter market
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
