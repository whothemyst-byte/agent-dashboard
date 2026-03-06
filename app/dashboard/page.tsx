"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AgentCard from "@/components/agents/AgentCard";
import { TaskInput } from "@/components/dashboard/TaskInput";
import { Badge } from "@/components/ui/badge";
import { getUser, signOut } from "@/lib/auth";
import type { Agent, User } from "@/lib/types";
import { useAgents } from "@/hooks/useAgents";
import { useTaskStream } from "@/hooks/useTaskStream";

function DashboardContent() {
  const router = useRouter();
  const composerRef = useRef<HTMLDivElement | null>(null);
  const { agents, loading } = useAgents();
  const { isRunning, outputs, activeAgent, error, runTask } = useTaskStream();
  const [user, setUser] = useState<User | null>(null);
  const [task, setTask] = useState("");
  const [model, setModel] = useState("haiku");

  useEffect(() => {
    async function loadUser() {
      const authUser = await getUser();
      if (!authUser) return;

      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        plan: "free",
        tasksUsedThisMonth: 0,
        agentsCreated: agents.length,
      });
    }

    loadUser();
  }, [agents.length]);

  const totalTokens = outputs.reduce((sum, item) => sum + item.tokensUsed, 0);
  const runningAgents = agents.filter((agent) => agent.status === "running").length;

  async function launchTask() {
    if (!task.trim()) return;
    await runTask(task, user?.id ?? "demo-user");
  }

  function scrollToComposer() {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleRunAgent(agentId: string) {
    const agent = agents.find((item) => item.id === agentId);
    const prompt = agent
      ? `Run ${agent.name} on this goal: ${task || "Define a plan and produce a useful output."}`
      : task;
    setTask(prompt);
    scrollToComposer();
  }

  function handleConfigureAgent(agent: Agent) {
    router.push(`/agents?agent=${agent.id}`);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  return (
    <main className="min-h-screen bg-[#0f0f1a] p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-[1440px]">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-[#1a1a2e] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8560a] font-black text-white">
              AO
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">AgentOS</p>
              <p className="text-xs text-zinc-500">Multi-agent command center</p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Badge className="border-zinc-700 bg-zinc-900 px-3 py-1 text-zinc-200 hover:bg-zinc-900">
              {(user?.plan ?? "free").toUpperCase()} plan
            </Badge>
            <button
              type="button"
              onClick={scrollToComposer}
              className="rounded-lg bg-[#e8560a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6a1f]"
            >
              + New Task
            </button>
            <Link
              href="/pricing"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
            >
              Pricing
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="grid h-10 w-10 place-items-center rounded-full bg-zinc-800 text-sm font-bold"
              title={user?.email || "Sign out"}
            >
              {(user?.email?.[0] ?? "U").toUpperCase()}
            </button>
          </div>
        </nav>

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total Agents", value: String(agents.length) },
            { label: "Tasks Today", value: String(outputs.length || 0) },
            { label: "Tasks Running", value: String(isRunning ? 1 : 0) },
            { label: "Tokens Used", value: String(totalTokens) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-[#1a1a2e] p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-zinc-100">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 flex flex-col gap-4 xl:flex-row">
          <div className="space-y-4 xl:w-[70%]">
            <div ref={composerRef}>
              <TaskInput
                task={task}
                model={model}
                isRunning={isRunning}
                outputs={outputs}
                activeAgent={activeAgent}
                error={error}
                onTaskChange={setTask}
                onModelChange={setModel}
                onLaunch={launchTask}
              />
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Agent Grid</h2>
                  <p className="text-sm text-zinc-500">
                    Launch an agent directly or jump to agent configuration.
                  </p>
                </div>
                <Link href="/agents" className="text-sm font-medium text-[#e8560a] hover:text-[#ff6a1f]">
                  Manage agents
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? <p className="text-sm text-zinc-500">Loading agents...</p> : null}
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onRun={handleRunAgent}
                    onConfigure={handleConfigureAgent}
                    isRunning={agent.status === "running" || activeAgent === agent.role}
                  />
                ))}
                <Link
                  href="/agents"
                  className="grid min-h-[280px] place-items-center rounded-xl border border-dashed border-zinc-600 bg-[#1a1a2e]/40 p-5 text-center transition hover:border-[#e8560a]"
                >
                  <div>
                    <p className="text-3xl text-zinc-300">+</p>
                    <p className="mt-2 font-semibold text-zinc-100">Add Custom Agent</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Create specialist agents with custom prompts, models, and tools.
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-zinc-800 bg-[#1a1a2e] p-4 xl:w-[30%]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Real-time Task Feed</h2>
                <p className="text-xs text-zinc-500">Latest streamed outputs from active runs</p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
                <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-emerald-400" : "bg-zinc-500"}`} />
                {isRunning ? "Live" : "Idle"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {outputs.length === 0 ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-500">
                  No task output yet. Launch a task from Mission Control.
                </div>
              ) : (
                outputs
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <div
                      key={`${item.agentId}-${item.timestamp}-${index}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-100">{item.agentName}</p>
                        <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                          {item.agentRole}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-300">
                        {item.content}
                      </p>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <h3 className="text-sm font-semibold text-zinc-100">System Snapshot</h3>
              <div className="mt-3 space-y-2 text-sm text-zinc-400">
                <p>Active agent: {activeAgent || "none"}</p>
                <p>Running agents: {runningAgents}</p>
                <p>Signed in as: {user?.email || "loading..."}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
