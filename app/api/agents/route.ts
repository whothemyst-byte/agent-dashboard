import { NextResponse } from "next/server";
import type { Agent } from "@/lib/types";

const agents: Agent[] = [
  {
    id: "a-1",
    name: "Alpha",
    role: "researcher",
    description: "Research specialist",
    systemPrompt: "You are a research agent.",
    model: "claude-haiku-4-5",
    tools: ["web_search"],
    status: "running",
    lastOutput: "Gathered benchmark notes.",
    createdAt: new Date().toISOString(),
    userId: "demo-user",
    isDefault: true,
    color: "#10b981",
    icon: "🔎",
  },
  {
    id: "a-2",
    name: "Delta",
    role: "manager",
    description: "Task coordinator",
    systemPrompt: "You are a manager agent.",
    model: "claude-haiku-4-5",
    tools: ["scheduler"],
    status: "idle",
    lastOutput: "Waiting for next assignment.",
    createdAt: new Date().toISOString(),
    userId: "demo-user",
    isDefault: true,
    color: "#3b82f6",
    icon: "📌",
  },
];

export async function GET() {
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Pick<Agent, "name" | "role">;
  const agent: Agent = {
    id: `a-${Date.now()}`,
    name: body.name,
    role: body.role,
    description: "",
    systemPrompt: "",
    model: "claude-haiku-4-5",
    tools: [],
    status: "idle",
    lastOutput: "",
    createdAt: new Date().toISOString(),
    userId: "demo-user",
    isDefault: false,
    color: "#6366f1",
    icon: "🤖",
  };

  agents.unshift(agent);
  return NextResponse.json(agent, { status: 201 });
}
