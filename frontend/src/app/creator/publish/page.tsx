"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialForm = {
  name: "",
  tagline: "",
  description: "",
  categories: "Engineering",
  capabilities: "Code review,Refactoring",
  permissions:
    "perm_docs_read|Read uploaded documents|Read invocation-bound files.|medium|true",
  priceModel: "per_run",
  price: "10",
  owner: "Creator Name",
  packageVersion: "1.0.0",
  entryPoint: "main.py",
  runtime: "python3.11",
};

export default function PublishPage() {
  const [form, setForm] = useState(initialForm);
  const [checks, setChecks] = useState<string[]>([]);

  const publishMutation = useMutation({
    mutationFn: () => {
      const payload = toPayload(form);
      return api.publishAgent(payload);
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      const payload = toPayload(form);
      const result = await api.validatePackage(payload);
      setChecks(result.checks);
      return result;
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-semibold">Creator Publishing Wizard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Agent Package Contract Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(form).map(([key, value]) =>
              key === "description" || key === "permissions" ? (
                <Textarea
                  key={key}
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={key}
                />
              ) : (
                <Input
                  key={key}
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={key}
                />
              ),
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => validateMutation.mutate()}>
                Validate package
              </Button>
              <Button onClick={() => publishMutation.mutate()}>Publish agent</Button>
            </div>
            {checks.length > 0 ? (
              <ul className="space-y-1 text-sm text-emerald-300">
                {checks.map((check) => (
                  <li key={check}>- {check}</li>
                ))}
              </ul>
            ) : null}
            {publishMutation.data ? (
              <p className="text-sm text-emerald-300">
                Published `{publishMutation.data.name}` successfully.
              </p>
            ) : null}
            {publishMutation.isError ? (
              <p className="text-sm text-red-300">{publishMutation.error.message}</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function toPayload(form: typeof initialForm) {
  return {
    name: form.name,
    tagline: form.tagline,
    description: form.description,
    categories: form.categories.split(",").map((s) => s.trim()),
    capabilities: form.capabilities.split(",").map((s) => s.trim()),
    permissions: form.permissions.split(",").map((entry) => {
      const [id, name, description, risk, required] = entry
        .split("|")
        .map((x) => x.trim());
      return {
        id,
        name,
        description,
        risk,
        required: required === "true",
      };
    }),
    priceModel: form.priceModel,
    price: Number(form.price),
    owner: form.owner,
    packageVersion: form.packageVersion,
    entryPoint: form.entryPoint,
    runtime: form.runtime,
  };
}
