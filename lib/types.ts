export type AgentRole =
  | "ceo" | "manager" | "tech_lead" | "researcher"
  | "analyst" | "coder" | "writer" | "qa" | "custom";

export type AgentStatus = "idle" | "running" | "done" | "error" | "waiting";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  model: "claude-haiku-4-5" | "claude-sonnet-4-6" | "groq-llama-70b";
  tools: string[];
  status: AgentStatus;
  lastOutput: string;
  createdAt: string;
  userId: string;
  isDefault: boolean;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  assignedAgents: string[];
  outputs: AgentOutput[];
  createdAt: string;
  completedAt?: string;
  userId: string;
}

export interface AgentOutput {
  agentId: string;
  agentName: string;
  agentRole: AgentRole;
  content: string;
  timestamp: string;
  tokensUsed: number;
}

export interface AgentMessage {
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  plan: "free" | "pro" | "agency" | "enterprise";
  tasksUsedThisMonth: number;
  agentsCreated: number;
}
