"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function DashboardPage() {
  const qc = useQueryClient();
  const [keyName, setKeyName] = useState("New Assistant Key");
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard(),
  });

  const createKeyMutation = useMutation({
    mutationFn: () => api.createApiKey(keyName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  if (dashboardQuery.isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (!dashboardQuery.data) return <div className="p-8">No dashboard data.</div>;

  const { billing, invocations, apiKeys } = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-semibold">User & Assistant Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-4">
          <Metric title="Credits" value={String(billing.creditsBalance)} />
          <Metric title="Monthly Spend" value={`${billing.monthlySpend} credits`} />
          <Metric title="Invocations" value={String(billing.totalInvocations)} />
          <Metric title="Plan" value={billing.currentPlan} />
        </div>

        <Tabs defaultValue="invocations">
          <TabsList>
            <TabsTrigger value="invocations">Invocations</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="invocations" className="mt-4 space-y-3">
            {invocations.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="pt-6">
                  <p className="font-medium">{inv.agentName}</p>
                  <p className="text-sm text-zinc-400">{inv.input}</p>
                  <p className="mt-2 text-sm">Result: {inv.result}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="audit" className="mt-4 space-y-3">
            {invocations.map((inv) => (
              <Card key={inv.id}>
                <CardHeader>
                  <CardTitle>{inv.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-zinc-300">
                  {inv.auditTrail.map((item) => (
                    <p key={item.at + item.event}>
                      {item.event}: {item.detail}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="keys" className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} />
              <Button onClick={() => createKeyMutation.mutate()}>Generate key</Button>
            </div>
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="pt-6">
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-zinc-400">{key.keyPreview}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-zinc-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
