import { NextResponse } from "next/server";
import type { Task } from "@/lib/types";

const tasks: Task[] = [
  {
    id: "t-1",
    title: "Summarize weekly incident report",
    description: "Compile a concise incident summary for leadership.",
    status: "completed",
    assignedAgents: ["a-1"],
    outputs: [],
    createdAt: new Date().toISOString(),
    userId: "demo-user",
  },
  {
    id: "t-2",
    title: "Validate vector index freshness",
    description: "Check index freshness and stale embeddings.",
    status: "running",
    assignedAgents: ["a-2"],
    outputs: [],
    createdAt: new Date().toISOString(),
    userId: "demo-user",
  },
];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Pick<Task, "title" | "assignedAgents">;
  const task: Task = {
    id: `t-${Date.now()}`,
    title: body.title,
    description: "",
    status: "pending",
    assignedAgents: body.assignedAgents ?? [],
    outputs: [],
    createdAt: new Date().toISOString(),
    userId: "demo-user",
  };

  tasks.unshift(task);
  return NextResponse.json(task, { status: 201 });
}
