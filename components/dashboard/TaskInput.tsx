"use client";

import type { AgentOutput } from "@/lib/types";
import type { UserPlan } from "@/lib/user-plan";
import { Send, Cpu, ChevronDown } from "lucide-react";

const iconByRole: Record<string, string> = {
  ceo: "👔",
  manager: "📋",
  tech_lead: "💻",
  researcher: "🔬",
  analyst: "📊",
  coder: "⌨️",
  writer: "✍️",
  qa: "🔍",
};

type TaskInputProps = {
  task: string;
  model: string;
  userPlan: UserPlan;
  isRunning: boolean;
  outputs: AgentOutput[];
  activeAgent: string;
  error: string;
  onTaskChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onLaunch: () => Promise<void> | void;
};

export function TaskInput({
  task,
  model,
  userPlan,
  isRunning,
  outputs,
  activeAgent,
  error,
  onTaskChange,
  onModelChange,
  onLaunch,
}: TaskInputProps) {
  const modelOptions =
    userPlan === "agency" || userPlan === "enterprise"
      ? [
        { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6 ⚡" },
        { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
      ]
      : userPlan === "pro"
        ? [{ value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" }]
        : [
          { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)" },
          { value: "qwen/qwen3-coder:free", label: "Qwen3 Coder (Free)" },
          { value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small (Free)" },
        ];

  return (
    <section className="glass-card rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#e8560a]/20">
              <Cpu className="h-3.5 w-3.5 text-[#e8560a]" />
            </div>
            <h2 className="text-base font-bold text-zinc-100">Mission Control</h2>
          </div>
          <p className="mt-1 pl-9 text-sm text-zinc-500">
            Write a goal, launch the workflow, and watch each agent report back live.
          </p>
        </div>
        <div
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${activeAgent
              ? "border-[#e8560a]/40 bg-[#e8560a]/10 text-[#e8560a]"
              : "border-zinc-700/60 bg-zinc-900/50 text-zinc-500"
            }`}
        >
          {activeAgent ? `● ${activeAgent}` : "● standby"}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative mt-4">
        <textarea
          value={task}
          onChange={(event) => onTaskChange(event.target.value)}
          placeholder="Describe the outcome you want. Example: research competitors, identify risks, propose architecture, and draft rollout plan."
          className="w-full min-h-36 resize-none rounded-xl border border-zinc-700/60 bg-zinc-950/50 p-4 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 backdrop-blur-sm transition focus:border-[#e8560a]/60 focus:outline-none focus:ring-1 focus:ring-[#e8560a]/30"
        />
        <div className="absolute bottom-3 right-3 text-xs text-zinc-600">{task.length}</div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="appearance-none rounded-xl border border-zinc-700/60 bg-zinc-900/60 pl-4 pr-10 py-2.5 text-sm text-zinc-200 backdrop-blur-sm transition focus:border-[#e8560a]/60 focus:outline-none focus:ring-1 focus:ring-[#e8560a]/30"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>

        <button
          type="button"
          onClick={onLaunch}
          disabled={isRunning || !task.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(232,86,10,0.35)] transition hover:shadow-[0_4px_24px_rgba(232,86,10,0.5)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]"
        >
          {isRunning ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Task Running...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Launch Task
            </>
          )}
        </button>
      </div>

      {/* Activity feed */}
      <div className="mt-5 rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Agent Activity Feed</h3>
          <span className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-500">{outputs.length} events</span>
        </div>
        <p className="mt-1.5 text-xs text-zinc-600">
          Your plan controls which models are available. Agents route through OpenRouter.
        </p>

        {error ? (
          <div className="mt-3 rounded-xl border border-red-800/40 bg-red-950/20 px-3 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : null}

        <div className="mt-3 space-y-2.5">
          {outputs.length === 0 ? (
            <p className="py-3 text-center text-xs text-zinc-600">No output yet. Launch a task to start the stream.</p>
          ) : (
            outputs
              .slice()
              .reverse()
              .map((output, index) => (
                <article
                  key={`${output.agentId}-${output.timestamp}-${index}`}
                  className="rounded-xl border border-zinc-800/50 bg-[#141423] p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-zinc-800 text-base">
                      {iconByRole[output.agentRole] ?? "🤖"}
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">{output.agentName}</p>
                      <span className="text-xs text-zinc-600">{output.tokensUsed} tokens</span>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 pl-9 text-xs leading-relaxed text-zinc-400">
                    {output.content}
                  </p>
                </article>
              ))
          )}
        </div>
      </div>
    </section>
  );
}
