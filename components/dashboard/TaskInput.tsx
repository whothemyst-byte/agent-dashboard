"use client";

import { useMemo, useState } from "react";
import { useTaskStream } from "@/hooks/useTaskStream";

const iconByRole: Record<string, string> = {
  ceo: "👑",
  manager: "📌",
  tech_lead: "⚙️",
  researcher: "🔎",
  analyst: "📊",
  coder: "💻",
  writer: "✍️",
  qa: "🧪",
};

export function TaskInput() {
  const [task, setTask] = useState("");
  const [model, setModel] = useState("haiku");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const { isRunning, outputs, activeAgent, error, runTask } = useTaskStream();

  const userId = "demo-user";

  const onLaunch = async () => {
    if (!task.trim()) return;
    await runTask(task, userId);
  };

  const activity = useMemo(() => [...outputs].reverse(), [outputs]);

  return (
    <section className="rounded-xl border border-zinc-800 bg-[#1a1a2e] p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Launch Task</h2>
      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Describe the goal you want the agents to execute..."
        className="mt-3 min-h-32 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 p-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-500"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="haiku">Use Haiku (fast/cheap)</option>
          <option value="sonnet">Use Sonnet (smart)</option>
        </select>
        <button
          type="button"
          onClick={onLaunch}
          disabled={isRunning}
          className="rounded-md bg-[#e8560a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6a1f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Running..." : "Launch Task"}
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">Agent Activity Feed</h3>
          <span className="text-xs text-zinc-400">
            {activeAgent ? `Active: ${activeAgent}` : "Idle"}
          </span>
        </div>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
        <div className="mt-3 space-y-2">
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-500">No output yet.</p>
          ) : (
            activity.map((output, idx) => {
              const isExpanded = !!expanded[idx];
              const icon = iconByRole[output.agentRole] ?? "🤖";
              return (
                <article
                  key={`${output.agentId}-${idx}-${output.timestamp}`}
                  className="rounded-md border border-zinc-800 bg-[#141423] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-100">
                      <span className="mr-2">{icon}</span>
                      {output.agentName}
                    </p>
                    <span className="text-xs text-zinc-400">
                      Tokens: {output.tokensUsed}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm text-zinc-300 ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {output.content}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="mt-2 text-xs font-medium text-[#e8560a] hover:text-[#ff6a1f]"
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
