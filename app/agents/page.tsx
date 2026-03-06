"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AgentBuilder } from "@/components/agents/AgentBuilder";
import AgentCard from "@/components/agents/AgentCard";
import { AgentChat } from "@/components/agents/AgentChat";
import { useAgents } from "@/hooks/useAgents";
import type { Agent } from "@/lib/types";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";

export default function AgentsPage() {
  const router = useRouter();
  const { agents, loading, createAgent, updateAgent, userPlan } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSelectedAgentId(params.get("agent"));
  }, []);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  const handleRun = (agentId: string) => { console.log("Run agent:", agentId); };
  const handleConfigure = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    router.replace(`/agents?agent=${agent.id}`);
  };
  const clearSelection = () => {
    setSelectedAgentId(null);
    router.replace("/agents");
  };

  return (
    <AuthGuard>
      <main className="min-h-screen space-bg p-6 text-zinc-100">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition mb-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold text-zinc-100">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8560a]/20 text-[#e8560a]">
                  <Bot className="h-4 w-4" />
                </span>
                Agents
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Create persistent agents, configure them, and changes will remain after relogin.
              </p>
            </div>
            {userPlan === "free" && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl border border-[#e8560a]/40 bg-[#e8560a]/10 px-4 py-2.5 text-sm font-semibold text-[#e8560a] transition hover:bg-[#e8560a]/20"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade for custom agents
              </Link>
            )}
          </div>

          {/* Agent builder */}
          <AgentBuilder
            userPlan={userPlan}
            selectedAgent={selectedAgent}
            onCreate={createAgent}
            onUpdate={updateAgent}
            onCancelEdit={clearSelection}
          />

          {/* Agent grid */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Your Agents</h2>
              <span className="text-xs text-zinc-600">{agents.length} agent{agents.length !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 py-8 text-sm text-zinc-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e8560a]" />
                Loading agents...
              </div>
            ) : agents.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <Bot className="mx-auto h-10 w-10 text-zinc-600" />
                <p className="mt-3 font-semibold text-zinc-300">No agents yet</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {userPlan === "free"
                    ? "Complete onboarding to activate your default backbone agents."
                    : "Use the builder above to create your first agent."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onRun={handleRun}
                    onConfigure={handleConfigure}
                    isRunning={agent.status === "running"}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Agent chat */}
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Agent Chat</h2>
            <AgentChat />
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
