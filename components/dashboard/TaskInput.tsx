"use client";

import type { AgentOutput } from "@/lib/types";
import type { UserPlan } from "@/lib/user-plan";

const iconByRole: Record<string, string> = {
  ceo: "CEO",
  manager: "PM",
  tech_lead: "TL",
  researcher: "RS",
  analyst: "AN",
  coder: "CD",
  writer: "WR",
  qa: "QA",
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
          { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
          { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
        ]
      : userPlan === "pro"
        ? [{ value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" }]
        : [
            { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B" },
            { value: "qwen/qwen3-coder:free", label: "Qwen3 Coder" },
            { value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small" },
          ];

  return (
    <section className="rounded-2xl border border-zinc-800 bg-[#1a1a2e] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Mission Control</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Write a goal, launch the workflow, and watch each agent report back live.
          </p>
        </div>
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
          {activeAgent ? `active: ${activeAgent}` : "standby"}
        </span>
      </div>

      <textarea
        value={task}
        onChange={(event) => onTaskChange(event.target.value)}
        placeholder="Describe the outcome you want. Example: research competitors, identify risks, propose architecture, and draft rollout plan."
        className="mt-4 min-h-36 w-full rounded-xl border border-zinc-700 bg-zinc-950/70 p-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#e8560a]"
      />

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onLaunch}
          disabled={isRunning || !task.trim()}
          className="rounded-lg bg-[#e8560a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff6a1f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Task Running..." : "Launch Task"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">Agent Activity Feed</h3>
          <span className="text-xs text-zinc-500">{outputs.length} updates</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Your plan controls which models are available. Agents route through OpenRouter with plan-aware defaults.
        </p>

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        <div className="mt-3 space-y-3">
          {outputs.length === 0 ? (
            <p className="text-sm text-zinc-500">No output yet. Launch a task to start the stream.</p>
          ) : (
            outputs
              .slice()
              .reverse()
              .map((output, index) => (
                <article
                  key={`${output.agentId}-${output.timestamp}-${index}`}
                  className="rounded-lg border border-zinc-800 bg-[#141423] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-100">
                      <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-zinc-800 text-[11px] text-zinc-200">
                        {iconByRole[output.agentRole] ?? "AG"}
                      </span>
                      {output.agentName}
                    </p>
                    <span className="text-xs text-zinc-500">{output.tokensUsed} tokens</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-300">
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
