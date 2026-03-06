"use client";

import { useEffect, useState } from "react";
import type { Agent, AgentRole } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getModel } from "@/lib/model-routing";
import { getAgentModelOptions, getDefaultRoleSet, getUserPlan, type UserPlan } from "@/lib/user-plan";

function buildDefaultAgents(plan: UserPlan): Agent[] {
  return getDefaultRoleSet().map((item) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    description: item.description,
    systemPrompt: item.systemPrompt,
    model: getModel(plan, item.role),
    tools: [],
    status: "idle",
    lastOutput: "",
    createdAt: new Date(0).toISOString(),
    userId: "default",
    isDefault: true,
    color: item.color,
    icon: item.icon,
  }));
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
  const [userPlan, setUserPlan] = useState<UserPlan>("free");
  const [needsAgentSelection, setNeedsAgentSelection] = useState(false);
  const [availableDefaultAgents, setAvailableDefaultAgents] = useState<Agent[]>([]);

  useEffect(() => {
    async function loadAgents() {
      try {
        const authUser = await getUser();
        if (!authUser) {
          const fallbackAgents = buildDefaultAgents("free");
          setAvailableDefaultAgents(fallbackAgents);
          setAgents(fallbackAgents);
          return;
        }

        setUserId(authUser.id);
        const plan = await getUserPlan(authUser.id);
        setUserPlan(plan);
        const planDefaults = buildDefaultAgents(plan);
        setAvailableDefaultAgents(planDefaults);
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const dbAgents = (data ?? []).map(mapDbAgent);

        if (plan === "free") {
          if (dbAgents.length === 0) {
            setNeedsAgentSelection(true);
            setAgents([]);
          } else {
            setNeedsAgentSelection(false);
            setAgents(dbAgents);
          }
          return;
        }

        const mergedDefaults = planDefaults.filter(
          (defaultAgent) => !dbAgents.some((item) => item.role === defaultAgent.role && item.isDefault),
        );
        setNeedsAgentSelection(false);
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

    if (userPlan === "free") {
      throw new Error("Free plan users can only use the 3 selected default agents.");
    }

    if (userPlan === "pro" && agents.filter((agent) => !agent.isDefault).length >= 15) {
      throw new Error("Pro plan supports up to 15 total agents including custom agents.");
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

  const selectDefaultAgents = async (agentIds: string[]) => {
    const authUserId = userId || (await getUser())?.id;
    if (!authUserId) {
      throw new Error("You must be signed in to select default agents.");
    }

    if (userPlan !== "free") {
      return;
    }

    if (agentIds.length !== 3) {
      throw new Error("Select exactly 3 agents for the free plan.");
    }

    const selected = availableDefaultAgents.filter((agent) => agentIds.includes(agent.id));
    const payload = selected.map((agent) => toDbPayload(agent, authUserId));
    const { data, error } = await supabase.from("agents").insert(payload).select();
    if (error) throw error;

    setNeedsAgentSelection(false);
    setAgents((data ?? []).map(mapDbAgent));
  };

  return {
    agents,
    loading,
    userPlan,
    needsAgentSelection,
    availableDefaultAgents,
    createAgent,
    updateAgent,
    selectDefaultAgents,
  };
}
