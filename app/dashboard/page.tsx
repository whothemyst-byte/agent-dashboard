import type { AgentRole, AgentStatus } from "@/lib/types";

type DashboardAgent = {
  id: string;
  name: string;
  role: AgentRole;
  icon: string;
  color: string;
  status: AgentStatus;
  lastOutput: string;
};

const agents: DashboardAgent[] = [
  {
    id: "ceo-agent",
    name: "CEO Agent",
    role: "ceo",
    icon: "👑",
    color: "indigo",
    status: "idle",
    lastOutput: "Set quarterly delivery goals and aligned all teams around launch milestones.",
  },
  {
    id: "manager-agent",
    name: "Manager Agent",
    role: "manager",
    icon: "📌",
    color: "blue",
    status: "running",
    lastOutput: "Prioritized today's queue and assigned high-impact tasks to specialist agents.",
  },
  {
    id: "tech-lead-agent",
    name: "Tech Lead Agent",
    role: "tech_lead",
    icon: "⚙️",
    color: "cyan",
    status: "done",
    lastOutput: "Reviewed architecture diffs and approved the rollout strategy for streaming updates.",
  },
  {
    id: "researcher-agent",
    name: "Researcher Agent",
    role: "researcher",
    icon: "🔎",
    color: "green",
    status: "running",
    lastOutput: "Compiled latest findings on model latency tradeoffs and benchmarked alternatives.",
  },
  {
    id: "analyst-agent",
    name: "Analyst Agent",
    role: "analyst",
    icon: "📊",
    color: "yellow",
    status: "idle",
    lastOutput: "Detected an efficiency gain in prompt routing that could reduce token usage by 14%.",
  },
  {
    id: "coder-agent",
    name: "Coder Agent",
    role: "coder",
    icon: "💻",
    color: "purple",
    status: "error",
    lastOutput: "Encountered a schema mismatch in output serialization while generating patch set.",
  },
  {
    id: "writer-agent",
    name: "Writer Agent",
    role: "writer",
    icon: "✍️",
    color: "pink",
    status: "done",
    lastOutput: "Delivered customer-facing release notes and updated system operation documentation.",
  },
  {
    id: "qa-agent",
    name: "QA Agent",
    role: "qa",
    icon: "🧪",
    color: "red",
    status: "running",
    lastOutput: "Executing regression suite for dashboard components and API route validations.",
  },
];

const statusClassMap: Record<AgentStatus, string> = {
  idle: "bg-emerald-400",
  running: "bg-amber-400",
  error: "bg-red-400",
  done: "bg-sky-400",
  waiting: "bg-zinc-400",
};

const borderClassMap: Record<string, string> = {
  indigo: "border-l-indigo-400",
  blue: "border-l-blue-400",
  cyan: "border-l-cyan-400",
  green: "border-l-emerald-400",
  yellow: "border-l-yellow-400",
  purple: "border-l-purple-400",
  pink: "border-l-pink-400",
  red: "border-l-red-400",
};

const roleClassMap: Record<AgentRole, string> = {
  ceo: "bg-indigo-500/20 text-indigo-200",
  manager: "bg-blue-500/20 text-blue-200",
  tech_lead: "bg-cyan-500/20 text-cyan-200",
  researcher: "bg-emerald-500/20 text-emerald-200",
  analyst: "bg-yellow-500/20 text-yellow-200",
  coder: "bg-purple-500/20 text-purple-200",
  writer: "bg-pink-500/20 text-pink-200",
  qa: "bg-red-500/20 text-red-200",
  custom: "bg-zinc-500/20 text-zinc-200",
};

const feedItems = [
  "[CEO Agent] Finalized sprint objective: improve orchestration throughput.",
  "[Researcher Agent] Added benchmark snapshot for Claude Sonnet 4.6.",
  "[Coder Agent] Build interrupted by schema mismatch in agent_outputs.",
  "[QA Agent] 28 end-to-end tests completed, 1 flaky case under review.",
  "[Manager Agent] Escalated retry policy update to Tech Lead Agent.",
  "[Writer Agent] Published v1 dashboard handoff summary.",
];

function AgentCard({ agent }: { agent: DashboardAgent }) {
  return (
    <article
      className={`rounded-xl border border-zinc-800 bg-[#1a1a2e] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:border-zinc-700 ${borderClassMap[agent.color]} border-l-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-900 text-xl">
            {agent.icon}
          </div>
          <div>
            <p className="text-base font-bold text-zinc-100">{agent.name}</p>
            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleClassMap[agent.role]}`}
            >
              {agent.role.replace("_", " ")}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-zinc-300">
          <span className={`h-2.5 w-2.5 rounded-full ${statusClassMap[agent.status]}`} />
          {agent.status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
        {agent.lastOutput}
      </p>
      <div className="mt-5 flex gap-2">
        <button className="flex-1 rounded-md bg-[#e8560a] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6a1f]">
          Run
        </button>
        <button className="flex-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500">
          Configure
        </button>
      </div>
    </article>
  );
}

function AddAgentCard() {
  return (
    <article className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-zinc-600 bg-[#1a1a2e]/40 p-5 text-center">
      <div>
        <p className="text-3xl text-zinc-300">+</p>
        <p className="mt-2 font-semibold text-zinc-100">Add Custom Agent</p>
        <p className="mt-1 text-sm text-zinc-400">
          Build a custom role with a tailored prompt and toolset.
        </p>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-[1440px]">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#1a1a2e] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8560a] font-black text-white">
              A
            </div>
            <p className="text-lg font-bold tracking-tight">AgentOS</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200">
              Pro Plan
            </span>
            <button className="rounded-md bg-[#e8560a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6a1f]">
              + New Task
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-700 text-sm font-bold">
              U
            </div>
          </div>
        </nav>

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total Agents", value: "8" },
            { label: "Tasks Today", value: "124" },
            { label: "Tasks Running", value: "19" },
            { label: "Tokens Used", value: "1.92M" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800 bg-[#1a1a2e] p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-zinc-100">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 flex flex-col gap-4 lg:flex-row">
          <div className="lg:w-[70%]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              <AddAgentCard />
            </div>
          </div>

          <aside className="rounded-xl border border-zinc-800 bg-[#1a1a2e] p-4 lg:w-[30%]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Real-time Task Feed</h2>
              <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {feedItems.map((item) => (
                <div key={item} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
