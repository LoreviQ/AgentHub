"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@agenthub.ai");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await api.login({ email, password });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to AgentHub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-400">
            Demo mode is enabled. Any email and password will create a mock session.
          </p>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
