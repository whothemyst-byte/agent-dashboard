"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AgentCard from "@/components/agents/AgentCard";
import { TaskInput } from "@/components/dashboard/TaskInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUser, signOut } from "@/lib/auth";
import type { Agent, User } from "@/lib/types";
import { useAgents } from "@/hooks/useAgents";
import { useTaskStream } from "@/hooks/useTaskStream";
import { LogOut, UserCircle2, Zap, BarChart3, Bot, Clock, Cpu } from "lucide-react";
import { getUserPlan } from "@/lib/user-plan";

function DashboardContent() {
  const router = useRouter();
  const composerRef = useRef<HTMLDivElement | null>(null);
  const { agents, loading, userPlan } = useAgents();
  const { isRunning, outputs, activeAgent, error, runTask } = useTaskStream();
  const [user, setUser] = useState<User | null>(null);
  const [task, setTask] = useState("");
  const [model, setModel] = useState("meta-llama/llama-3.3-70b-instruct:free");

  useEffect(() => {
    async function loadUser() {
      const authUser = await getUser();
      if (!authUser) return;
      const plan = await getUserPlan(authUser.id);
      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        plan,
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
    await runTask(task, user?.id ?? "demo-user", user?.plan ?? "free");
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

  const stats = [
    { label: "Total Agents", value: String(agents.length), icon: Bot, color: "#6366f1" },
    { label: "Tasks Today", value: String(outputs.length || 0), icon: BarChart3, color: "#10b981" },
    { label: "Tasks Running", value: String(isRunning ? 1 : 0), icon: Cpu, color: isRunning ? "#e8560a" : "#71717a" },
    { label: "Tokens Used", value: totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : String(totalTokens), icon: Zap, color: "#f59e0b" },
  ];

  return (
    <main className="min-h-screen space-bg p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-[1440px] space-y-4">

        {/* Navigation */}
        <nav className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#e8560a] to-[#ff8c00] shadow-[0_0_16px_rgba(232,86,10,0.4)]">
              <span className="text-sm font-black text-white">AO</span>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-zinc-100">AgentOS</p>
              <p className="text-[11px] text-zinc-500">Multi-agent command center</p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-zinc-700/50 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              {(user?.plan ?? "free").toUpperCase()} Plan
            </span>
            <button
              type="button"
              onClick={scrollToComposer}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-4 py-2 text-sm font-bold text-white shadow-[0_0_12px_rgba(232,86,10,0.3)] transition hover:shadow-[0_0_20px_rgba(232,86,10,0.5)] active:scale-[0.97]"
            >
              <span className="text-base leading-none">+</span> New Task
            </button>
            <Link
              href="/pricing"
              className="rounded-lg border border-zinc-700/50 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/60"
            >
              Pricing
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-700/50 bg-zinc-800/60 text-sm font-bold text-zinc-100 transition hover:bg-zinc-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8560a]"
                  title={user?.email || "Account"}
                >
                  {(user?.email?.[0] ?? "U").toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-[#141426] text-zinc-100">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="text-sm font-semibold">{user?.email || "Signed in user"}</p>
                  <p className="text-xs font-normal uppercase tracking-wide text-zinc-500">{(user?.plan ?? "free").toUpperCase()} plan</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer text-zinc-100 focus:bg-zinc-800 focus:text-white" onClick={() => router.push("/profile")}>
                  <UserCircle2 className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-300 focus:bg-zinc-800 focus:text-red-200" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Stats row */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card group rounded-2xl p-4 transition-all duration-200 hover:border-zinc-700/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-zinc-500">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-zinc-600 transition group-hover:text-zinc-400" style={{ color: stat.color + "99" }} />
              </div>
              <p className="mt-3 text-2xl font-bold text-zinc-100" style={{ textShadow: `0 0 20px ${stat.color}40` }}>
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Main area */}
        <section className="flex flex-col gap-4 xl:flex-row">
          {/* Left side - 70% */}
          <div className="space-y-4 xl:w-[70%]">
            <div ref={composerRef}>
              <TaskInput
                task={task}
                model={model}
                userPlan={userPlan}
                isRunning={isRunning}
                outputs={outputs}
                activeAgent={activeAgent}
                error={error}
                onTaskChange={setTask}
                onModelChange={setModel}
                onLaunch={launchTask}
              />
            </div>

            {/* Agent Grid */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Agent Grid</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Launch an agent directly or jump to configuration.</p>
                </div>
                <Link href="/agents" className="text-xs font-semibold text-[#e8560a] hover:text-[#ff6a1f] transition">
                  Manage agents →
                </Link>
              </div>


              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e8560a]" />
                    Loading agents...
                  </div>
                ) : null}
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
                  className="group flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-zinc-700/60 bg-[#1a1a2e]/30 p-5 text-center transition hover:border-[#e8560a]/60 hover:bg-[#e8560a]/5"
                >
                  <div>
                    <p className="text-2xl text-zinc-500 transition group-hover:text-[#e8560a]">+</p>
                    <p className="mt-1.5 text-sm font-semibold text-zinc-300">
                      {userPlan === "free" ? "Free Plan Locked" : "Add Custom Agent"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {userPlan === "free"
                        ? "Work with 3 selected default agents."
                        : "Create specialist agents with custom models."}
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* Right sidebar - 30% */}
          <aside className="glass-card rounded-2xl p-4 xl:w-[30%]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-100">Real-time Task Feed</h2>
                <p className="text-xs text-zinc-500">Streamed outputs from active runs</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-2.5 py-1 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
                {isRunning ? "Live" : "Idle"}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {outputs.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-center">
                  <Clock className="mx-auto h-6 w-6 text-zinc-600" />
                  <p className="mt-2 text-xs text-zinc-500">No output yet. Launch a task from Mission Control.</p>
                </div>
              ) : (
                outputs
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <div
                      key={`${item.agentId}-${item.timestamp}-${index}`}
                      className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-zinc-100">{item.agentName}</p>
                        <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                          {item.agentRole}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-400">
                        {item.content}
                      </p>
                    </div>
                  ))
              )}
            </div>

            {/* System snapshot */}
            <div className="mt-4 rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">System Snapshot</h3>
              <div className="mt-3 space-y-1.5 text-xs text-zinc-500">
                <div className="flex items-center justify-between">
                  <span>Active agent</span>
                  <span className="font-medium text-zinc-300">{activeAgent || "none"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Running agents</span>
                  <span className={`font-medium ${runningAgents > 0 ? "text-emerald-400" : "text-zinc-300"}`}>{runningAgents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signed in as</span>
                  <span className="max-w-[120px] truncate font-medium text-zinc-300">{user?.email || "loading..."}</span>
                </div>
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

