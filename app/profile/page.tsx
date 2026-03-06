"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getUser, signOut } from "@/lib/auth";
import type { User } from "@/lib/types";
import { getUserPlan } from "@/lib/user-plan";
import { ArrowLeft, LogOut, ExternalLink, User as UserIcon, Mail, Hash, BarChart3, Bot, Crown } from "lucide-react";

const planColors: Record<string, string> = {
  free: "#71717a",
  pro: "#6366f1",
  agency: "#e8560a",
  enterprise: "#f59e0b",
};

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const authUser = await getUser();
      if (!authUser) return;
      const plan = await getUserPlan(authUser.id);
      setUser({ id: authUser.id, email: authUser.email ?? "", plan, tasksUsedThisMonth: 0, agentsCreated: 0 });
    }
    loadUser();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  const planColor = planColors[user?.plan ?? "free"] ?? "#71717a";

  return (
    <main className="min-h-screen space-bg p-4 text-zinc-100 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Account</p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Profile</h1>
          </div>
        </div>

        {/* Main profile card */}
        <div className="glass-card rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.4)]" style={{ boxShadow: `0 2px 0 0 ${planColor}60, 0 16px 48px rgba(0,0,0,0.4)` }}>
          <div className="flex flex-wrap items-center gap-5">
            {/* Avatar */}
            <div
              className="relative grid h-20 w-20 place-items-center rounded-2xl text-3xl font-black text-white shadow-[0_0_24px_rgba(0,0,0,0.4)]"
              style={{ background: `linear-gradient(135deg, ${planColor}cc, ${planColor}88)` }}
            >
              {(user?.email?.[0] ?? "U").toUpperCase()}
              <div
                className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full text-white"
                style={{ background: planColor }}
              >
                <Crown className="h-3 w-3" />
              </div>
            </div>

            {/* Info */}
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Your Account</h2>
              <span
                className="mt-1 inline-flex rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider"
                style={{ color: planColor, borderColor: `${planColor}40`, background: `${planColor}15` }}
              >
                {(user?.plan ?? "free").toUpperCase()} plan
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <Mail className="h-3 w-3" /> Email
              </div>
              <p className="mt-2 font-mono text-sm text-zinc-100">{user?.email || "Loading..."}</p>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <Hash className="h-3 w-3" /> User ID
              </div>
              <p className="mt-2 break-all font-mono text-xs text-zinc-400">{user?.id || "Loading..."}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              { icon: UserIcon, label: "Plan", value: (user?.plan ?? "free"), color: planColor },
              { icon: BarChart3, label: "Tasks This Month", value: String(user?.tasksUsedThisMonth ?? 0), color: "#10b981" },
              { icon: Bot, label: "Agents Created", value: String(user?.agentsCreated ?? 0), color: "#6366f1" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                  <stat.icon className="h-3 w-3" style={{ color: stat.color }} />
                  {stat.label}
                </div>
                <p className="mt-2 text-xl font-bold capitalize text-zinc-100">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-800/60 pt-5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(232,86,10,0.3)] transition hover:shadow-[0_4px_20px_rgba(232,86,10,0.5)] active:scale-[0.97]"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/40 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/60"
            >
              <ExternalLink className="h-4 w-4" /> View plans
            </Link>
          </div>
        </div>

        {/* Activity placeholder */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Recent Activity</h3>
          <p className="text-sm text-zinc-500">
            Your task history and agent activity will appear here once you start running tasks.
          </p>
        </div>
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
