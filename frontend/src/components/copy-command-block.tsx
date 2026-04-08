"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyCommandBlockProps = {
  title: string;
  description: string;
  code: string;
};

export function CopyCommandBlock({
  title,
  description,
  code,
}: CopyCommandBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-[28px] border border-stone-900/10 bg-stone-950 text-stone-100 shadow-[0_24px_80px_rgba(28,25,23,0.18)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-[0.16em] uppercase">
            {title}
          </h3>
          <p className="mt-1 text-sm text-stone-300">{description}</p>
        </div>
        <Button
          onClick={copyCode}
          variant="outline"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto px-5 py-4 text-sm leading-6 whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
}
