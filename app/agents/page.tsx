"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AgentBuilder } from "@/components/agents/AgentBuilder";
import AgentCard from "@/components/agents/AgentCard";
import { AgentChat } from "@/components/agents/AgentChat";
import { useAgents } from "@/hooks/useAgents";
import type { Agent } from "@/lib/types";

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

  const handleRun = (agentId: string) => {
    console.log("Run agent:", agentId);
  };
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
      <main className="mx-auto max-w-6xl space-y-6 bg-[#0f0f1a] p-6 text-zinc-100">
        <div>
          <h1 className="text-2xl font-semibold">Agents</h1>
          <p className="text-sm text-zinc-400">
            Create persistent agents, configure them, and your changes will remain after relogin.
          </p>
        </div>
        <AgentBuilder
          userPlan={userPlan}
          selectedAgent={selectedAgent}
          onCreate={createAgent}
          onUpdate={updateAgent}
          onCancelEdit={clearSelection}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? <p className="text-zinc-400">Loading agents...</p> : null}
          {!loading && agents.length === 0 ? <p className="text-zinc-400">No agents created yet.</p> : null}
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
        <AgentChat />
      </main>
    </AuthGuard>
  );
}
