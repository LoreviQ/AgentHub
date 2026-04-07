"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Agent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function InvokeAgentDialog({ agent }: { agent: Agent }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("Review this sample input safely.");
  const [approved, setApproved] = useState<string[]>([]);

  const invokeMutation = useMutation({
    mutationFn: () =>
      api.invoke({
        agentId: agent.id,
        input: prompt,
        approvedPermissionIds: approved,
      }),
  });

  const togglePermission = (id: string) => {
    setApproved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Try / Invoke</Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className="mb-2 text-xl font-semibold">Approve Permissions</h3>
        <p className="mb-4 text-sm text-zinc-400">
          AgentHub requires explicit permission approval before invocation.
        </p>

        <div className="space-y-3">
          {agent.permissions.map((permission) => (
            <label
              key={permission.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 p-3"
            >
              <input
                type="checkbox"
                checked={approved.includes(permission.id)}
                onChange={() => togglePermission(permission.id)}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{permission.name}</span>
                  <Badge
                    variant={
                      permission.risk === "high"
                        ? "danger"
                        : permission.risk === "medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {permission.risk} risk
                  </Badge>
                  {permission.required && <Badge variant="warning">required</Badge>}
                </div>
                <p className="text-sm text-zinc-400">{permission.description}</p>
              </div>
            </label>
          ))}
        </div>

        <Textarea
          className="mt-4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the task for this agent..."
        />

        <Button
          className="mt-4 w-full"
          onClick={() => invokeMutation.mutate()}
          disabled={invokeMutation.isPending}
        >
          <LockKeyhole className="mr-2 h-4 w-4" />
          {invokeMutation.isPending
            ? "Spinning up secure environment..."
            : "Approve & Invoke"}
        </Button>

        {invokeMutation.isError ? (
          <p className="mt-3 text-sm text-red-300">
            <ShieldAlert className="mr-1 inline h-4 w-4" />
            {invokeMutation.error.message}
          </p>
        ) : null}

        {invokeMutation.data ? (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="font-medium text-emerald-300">Invocation complete</p>
            <p className="text-sm text-zinc-200">{invokeMutation.data.result}</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              {invokeMutation.data.auditTrail.map((item) => (
                <li key={item.at + item.event}>
                  {item.event}: {item.detail}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
