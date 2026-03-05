"use client";

import { create } from "zustand";
import type { Agent, Task } from "@/lib/types";

type AppStore = {
  agents: Agent[];
  tasks: Task[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  agents: [],
  tasks: [],
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({ agents: [agent, ...state.agents] })),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
}));
