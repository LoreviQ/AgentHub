import Link from "next/link";
import { Boxes, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-900/10 bg-[color:rgba(250,247,240,0.88)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-stone-900 uppercase"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-900/10 bg-stone-900 text-stone-50">
            <Shield className="h-4 w-4" />
          </span>
          AgentHub
        </Link>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <Badge className="border-emerald-700/20 bg-emerald-600/10 text-emerald-800">
            <Boxes className="mr-1 h-3 w-3" />
            2 packaged agents
          </Badge>
          <span className="hidden sm:inline">Shared runtime on controlled infrastructure</span>
        </div>
      </div>
    </header>
  );
}
