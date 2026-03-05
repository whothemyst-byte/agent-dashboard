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
  waiting: "bg-zinc-400",
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span>typing</span>
      <span className="dot h-1.5 w-1.5 rounded-full bg-zinc-300" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-zinc-300 [animation-delay:0.2s]" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-zinc-300 [animation-delay:0.4s]" />
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
    <article
      className={`rounded-xl border border-zinc-800 bg-[#1a1a2e] p-4 text-zinc-100 ${
        isRunning ? "running-glow" : ""
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: agent.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-full text-base"
            style={{ backgroundColor: `${agent.color}33` }}
          >
            {agent.icon || "🤖"}
          </div>
          <div>
            <p className="font-semibold">{agent.name}</p>
            <span className="mt-1 inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
              {agent.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 animate-pulse rounded-full ${statusDotClass[agent.status]}`}
          />
          {agent.status}
        </span>
        <span>{activityLabel}</span>
      </div>

      <div className="mt-3 rounded-lg bg-zinc-900/70 p-3 text-sm text-zinc-300">
        <p className="overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {isRunning ? (
            <TypingDots />
          ) : agent.lastOutput ? (
            agent.lastOutput
          ) : (
            "Waiting for task..."
          )}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onRun(agent.id)}
          className="flex-1 rounded-md bg-[#e8560a] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6a1f]"
        >
          ▶ Run
        </button>
        <button
          type="button"
          onClick={() => onConfigure(agent)}
          className="flex-1 rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
        >
          ⚙ Config
        </button>
      </div>

      <style jsx>{`
        .dot {
          animation: typingBounce 0.9s infinite ease-in-out;
        }

        .running-glow {
          animation: runningBorderPulse 1.5s infinite ease-in-out;
        }

        @keyframes typingBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @keyframes runningBorderPulse {
          0%,
          100% {
            box-shadow: 0 0 0 1px transparent;
          }
          50% {
            box-shadow: 0 0 0 1px rgba(232, 86, 10, 0.6);
          }
        }
      `}</style>
    </article>
  );
}
