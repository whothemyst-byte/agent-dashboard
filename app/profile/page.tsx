"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, signOut } from "@/lib/auth";
import type { User } from "@/lib/types";

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const authUser = await getUser();
      if (!authUser) return;

      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        plan: "free",
        tasksUsedThisMonth: 0,
        agentsCreated: 0,
      });
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  return (
    <main className="min-h-screen bg-[#0f0f1a] p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Account</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Profile</h1>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
          >
            Back to Dashboard
          </Link>
        </div>

        <Card className="border-zinc-800 bg-[#1a1a2e] shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e8560a] text-2xl font-bold text-white">
              {(user?.email?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-zinc-100">Your account</CardTitle>
              <Badge className="w-fit border-zinc-700 bg-zinc-900 px-3 py-1 text-zinc-200 hover:bg-zinc-900">
                {(user?.plan ?? "free").toUpperCase()} plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
                <p className="mt-2 text-sm text-zinc-100">{user?.email || "Loading..."}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">User ID</p>
                <p className="mt-2 break-all text-sm text-zinc-100">{user?.id || "Loading..."}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Plan</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100 capitalize">
                  {user?.plan ?? "free"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Tasks this month</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">
                  {user?.tasksUsedThisMonth ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Agents created</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">{user?.agentsCreated ?? 0}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleSignOut}
                className="bg-[#e8560a] text-white hover:bg-[#ff6a1f]"
              >
                Log out
              </Button>
              <Link href="/pricing" className="text-sm text-zinc-400 transition hover:text-zinc-200">
                View plans
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
