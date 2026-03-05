"use client";

import { AgentBuilder } from "@/components/agents/AgentBuilder";
import AgentCard from "@/components/agents/AgentCard";
import { AgentChat } from "@/components/agents/AgentChat";
import { useAgents } from "@/hooks/useAgents";
import type { Agent } from "@/lib/types";

export default function AgentsPage() {
  const { agents, loading, createAgent } = useAgents();
  const handleRun = (agentId: string) => {
    console.log("Run agent:", agentId);
  };
  const handleConfigure = (agent: Agent) => {
    console.log("Configure agent:", agent.id);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Agents</h1>
      <AgentBuilder onCreate={createAgent} />
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? <p>Loading agents...</p> : null}
        {!loading && agents.length === 0 ? <p>No agents created yet.</p> : null}
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
  );
}
