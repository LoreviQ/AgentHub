import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <Shield className="h-5 w-5 text-indigo-400" />
          AgentHub
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/creator/publish">
            <Button variant="ghost">Publish Agent</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
