"use client";

import { useEffect, useState } from "react";
import type { Agent, AgentRole } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const defaultPrompts: Record<AgentRole, string> = {
  ceo: `You are the CEO Agent, the strategic orchestrator of an AI agent team.
Your responsibilities:
1. Receive the user's high-level goal
2. Analyze and break it down into 3-5 clear subtasks
3. Assign each subtask to the most suitable agent
4. Define success criteria for each subtask
5. Synthesize all agent outputs into a final executive summary`,
  manager: `You are the Manager Agent.
1. Check dependencies between tasks
2. Route each task to the correct agent
3. Monitor completion and report blockers
4. Compile results for the CEO`,
  tech_lead: `You are the Tech Lead Agent.
1. Evaluate technical options for scalability, cost, and maintainability
2. Consider security and performance implications
3. Recommend the best approach with reasoning
4. Identify technical risks and mitigation steps
5. Define implementation steps`,
  researcher: `You are the Researcher Agent.
1. Identify key questions
2. Gather relevant information
3. Extract facts and insights
4. Cite sources when possible
5. Return structured findings`,
  analyst: `You are the Analyst Agent.
1. Review the available data and research
2. Identify patterns, trends, and anomalies
3. Produce actionable insights
4. Quantify findings when possible
5. Recommend next steps based on evidence`,
  coder: `You are the Coder Agent.
1. Understand the requirement completely
2. Choose the simplest working solution
3. Write clean, type-safe code
4. Include error handling
5. Add a usage example`,
  writer: `You are the Writer Agent.
1. Understand the audience and purpose
2. Structure content clearly
3. Use active voice and concrete language
4. Match the requested tone
5. Deliver polished, ready-to-use content`,
  qa: `You are the QA Agent.
1. Check output against requirements
2. Identify errors, gaps, or inconsistencies
3. Flag unverified claims
4. Check code for bugs or security issues
5. Return issues found, quality score, and approval status`,
  custom: "You are a custom specialist agent. Follow the user's instructions precisely and respond clearly.",
};

const defaultAgents: Agent[] = [
  createDefaultAgent("default-ceo", "CEO Agent", "ceo", "#6366f1", "CEO"),
  createDefaultAgent("default-manager", "Manager Agent", "manager", "#3b82f6", "MGR"),
  createDefaultAgent("default-tech-lead", "Tech Lead Agent", "tech_lead", "#06b6d4", "TL"),
  createDefaultAgent("default-researcher", "Researcher Agent", "researcher", "#10b981", "RES"),
  createDefaultAgent("default-analyst", "Analyst Agent", "analyst", "#f59e0b", "ANL"),
  createDefaultAgent("default-coder", "Coder Agent", "coder", "#8b5cf6", "DEV"),
  createDefaultAgent("default-writer", "Writer Agent", "writer", "#ec4899", "WRT"),
  createDefaultAgent("default-qa", "QA Agent", "qa", "#ef4444", "QA"),
];

function createDefaultAgent(
  id: string,
  name: string,
  role: AgentRole,
  color: string,
  icon: string,
): Agent {
  return {
    id,
    name,
    role,
    description: `${name} ready for orchestration.`,
    systemPrompt: defaultPrompts[role],
    model: "claude-haiku-4-5",
    tools: [],
    status: "idle",
    lastOutput: "",
    createdAt: new Date(0).toISOString(),
    userId: "default",
    isDefault: true,
    color,
    icon,
  };
}

function mapDbAgent(row: any): Agent {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    description: row.description ?? "",
    systemPrompt: row.system_prompt ?? "",
    model: row.model ?? "claude-haiku-4-5",
    tools: row.tools ?? [],
    status: row.status ?? "idle",
    lastOutput: row.last_output ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
    userId: row.user_id,
    isDefault: row.is_default ?? false,
    color: row.color ?? "#6366f1",
    icon: row.icon ?? "AG",
  };
}

function toDbPayload(agent: Partial<Agent>, userId: string) {
  return {
    user_id: userId,
    name: agent.name,
    role: agent.role,
    description: agent.description ?? "",
    system_prompt: agent.systemPrompt ?? "",
    model: agent.model ?? "claude-haiku-4-5",
    tools: agent.tools ?? [],
    status: agent.status ?? "idle",
    last_output: agent.lastOutput ?? "",
    color: agent.color ?? "#6366f1",
    icon: agent.icon ?? "AG",
    is_default: agent.isDefault ?? false,
  };
}

export function useAgents() {
  const agents = useAppStore((state) => state.agents);
  const setAgents = useAppStore((state) => state.setAgents);
  const addAgent = useAppStore((state) => state.addAgent);
  const updateAgentInStore = useAppStore((state) => state.updateAgent);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function loadAgents() {
      try {
        const authUser = await getUser();
        if (!authUser) {
          setAgents(defaultAgents);
          return;
        }

        setUserId(authUser.id);
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const dbAgents = (data ?? []).map(mapDbAgent);
        const mergedDefaults = defaultAgents.filter(
          (defaultAgent) => !dbAgents.some((item) => item.role === defaultAgent.role && item.isDefault),
        );
        setAgents([...mergedDefaults, ...dbAgents]);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, [setAgents]);

  const createAgent = async (payload: Partial<Agent> & Pick<Agent, "name" | "role">) => {
    const authUserId = userId || (await getUser())?.id;
    if (!authUserId) {
      throw new Error("You must be signed in to create agents.");
    }

    const { data, error } = await supabase
      .from("agents")
      .insert(toDbPayload(payload, authUserId))
      .select()
      .single();

    if (error) throw error;

    const agent = mapDbAgent(data);
    addAgent(agent);
    return agent;
  };

  const updateAgent = async (agentId: string, payload: Partial<Agent>) => {
    if (agentId.startsWith("default-")) {
      throw new Error("Default agents are not editable yet.");
    }

    const { data, error } = await supabase
      .from("agents")
      .update({
        name: payload.name,
        role: payload.role,
        description: payload.description,
        system_prompt: payload.systemPrompt,
        model: payload.model,
        tools: payload.tools,
        status: payload.status,
        last_output: payload.lastOutput,
        color: payload.color,
        icon: payload.icon,
      })
      .eq("id", agentId)
      .select()
      .single();

    if (error) throw error;

    const updated = mapDbAgent(data);
    updateAgentInStore(updated);
    return updated;
  };

  return { agents, loading, createAgent, updateAgent };
}
