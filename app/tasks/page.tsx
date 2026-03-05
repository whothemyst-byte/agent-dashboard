"use client";

import { useTaskStream } from "@/hooks/useTaskStream";
import { TaskFeed } from "@/components/dashboard/TaskFeed";

export default function TasksPage() {
  const { outputs, activeAgent, error } = useTaskStream();

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <TaskFeed />
      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Live Stream</h2>
        {activeAgent ? (
          <p className="mt-2 text-xs text-muted-foreground">Active agent: {activeAgent}</p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {outputs.length === 0 ? <li>Waiting for stream events...</li> : null}
          {outputs.map((event, idx) => (
            <li key={`${event.agentId}-${event.timestamp}-${idx}`}>
              [{event.agentRole}] {event.content}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
