import type { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  onRun: (agentId: string) => void;
  onConfigure: (agent: Agent) => void;
  isRunning?: boolean;
}

const statusDotClass: Record<Agent["status"], string> = {
  idle: "bg-emerald-400",
  running: "bg-amber-400",
  error: "bg-red-400",
  done: "bg-sky-400",
  waiting: "bg-zinc-500",
};

const statusLabel: Record<Agent["status"], string> = {
  idle: "Idle",
  running: "Running",
  error: "Error",
  done: "Done",
  waiting: "Waiting",
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-zinc-400">typing</span>
      {/* Uses .dot class from globals.css (animates typingBounce keyframe) */}
      <span className="dot h-1.5 w-1.5 rounded-full bg-zinc-300" style={{ animationDelay: "0s" }} />
      <span className="dot h-1.5 w-1.5 rounded-full bg-zinc-300" style={{ animationDelay: "0.2s" }} />
      <span className="dot h-1.5 w-1.5 rounded-full bg-zinc-300" style={{ animationDelay: "0.4s" }} />
    </span>
  );
}

export default function AgentCard({
  agent,
  onRun,
  onConfigure,
  isRunning = false,
}: AgentCardProps) {
  const activityLabel = new Date(agent.createdAt).toLocaleString();

  return (
    /* Uses .running-glow class from globals.css (runningBorderPulse keyframe) */
    <article
      className={`relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#1a1a2e]/90 p-4 text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${isRunning ? "running-glow" : ""
        }`}
      style={{ borderLeftWidth: 3, borderLeftColor: agent.color }}
    >
      {/* Ambient color glow based on agent theme */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.04]"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${agent.color}, transparent 70%)` }}
      />

      {/* Header: avatar + name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
            style={{
              backgroundColor: `${agent.color}20`,
              border: `1px solid ${agent.color}40`,
            }}
          >
            {agent.icon || "🤖"}
          </div>
          <div>
            <p className="font-semibold leading-tight text-zinc-100">{agent.name}</p>
            <span className="mt-0.5 inline-flex rounded-full bg-zinc-800/80 px-2 py-0.5 text-[11px] capitalize tracking-wide text-zinc-400">
              {agent.role.replace("_", " ")}
            </span>
          </div>
        </div>
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${statusDotClass[agent.status]} ${agent.status === "running" ? "animate-pulse" : ""
            }`}
          title={statusLabel[agent.status]}
        />
      </div>

      {/* Status row */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-zinc-500">{statusLabel[agent.status]}</span>
        <span className="text-zinc-600">{activityLabel}</span>
      </div>

      {/* Output preview */}
      <div className="mt-2 min-h-[52px] rounded-lg border border-zinc-800/50 bg-zinc-950/40 p-3 text-sm text-zinc-300">
        <p className="overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {isRunning ? (
            <TypingDots />
          ) : agent.lastOutput ? (
            agent.lastOutput
          ) : (
            <span className="italic text-zinc-600">Waiting for task...</span>
          )}
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onRun(agent.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-3 py-2 text-sm font-semibold text-white transition hover:shadow-[0_0_14px_rgba(232,86,10,0.45)] active:scale-[0.97]"
        >
          ▶ Run
        </button>
        <button
          type="button"
          onClick={() => onConfigure(agent)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/60 active:scale-[0.97]"
        >
          ⚙ Config
        </button>
      </div>
    </article>
  );
}
