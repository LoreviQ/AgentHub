"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyValueFieldProps = {
  label: string;
  value: string;
};

export function CopyValueField({ label, value }: CopyValueFieldProps) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-8 flex flex-col gap-3 text-sm md:flex-row md:items-center md:gap-4">
      <span className="font-mono uppercase tracking-[0.2em] text-cyan-300/85">
        {label}
      </span>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        <span className="hidden font-mono text-cyan-500/70 md:inline">-</span>
        <span className="w-fit max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/35 px-3 py-2 font-mono text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {value}
        </span>
        <Button
          type="button"
          onClick={copyValue}
          variant="outline"
          className="w-fit border-cyan-400/35 bg-cyan-400/10 font-mono text-cyan-100 hover:bg-cyan-400/18"
        >
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
