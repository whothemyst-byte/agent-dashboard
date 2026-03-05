"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { Agent } from "@/lib/types";
import { useAppStore } from "@/lib/store";

export function useAgents() {
  const agents = useAppStore((state) => state.agents);
  const setAgents = useAppStore((state) => state.setAgents);
  const addAgent = useAppStore((state) => state.addAgent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        const { data } = await axios.get<Agent[]>("/api/agents");
        setAgents(data);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, [setAgents]);

  const createAgent = async (payload: Pick<Agent, "name" | "role">) => {
    const { data } = await axios.post<Agent>("/api/agents", payload);
    addAgent(data);
    return data;
  };

  return { agents, loading, createAgent };
}
