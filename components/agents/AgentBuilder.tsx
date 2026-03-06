"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Agent, AgentRole } from "@/lib/types";
import { getAgentModelOptions, type UserPlan } from "@/lib/user-plan";

type AgentBuilderProps = {
  userPlan: UserPlan;
  selectedAgent?: Agent | null;
  onCreate: (payload: Partial<Agent> & { name: string; role: AgentRole }) => Promise<unknown>;
  onUpdate: (agentId: string, payload: Partial<Agent>) => Promise<unknown>;
  onCancelEdit: () => void;
};

const roles: AgentRole[] = [
  "ceo",
  "manager",
  "tech_lead",
  "researcher",
  "analyst",
  "coder",
  "writer",
  "qa",
  "custom",
];

const defaultForm = {
  name: "",
  role: "custom" as AgentRole,
  description: "",
  systemPrompt: "",
  model: "meta-llama/llama-3.3-70b-instruct:free" as Agent["model"],
  tools: "",
  color: "#6366f1",
  icon: "AG",
};

export function AgentBuilder({ userPlan, selectedAgent, onCreate, onUpdate, onCancelEdit }: AgentBuilderProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("custom");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState<Agent["model"]>("meta-llama/llama-3.3-70b-instruct:free");
  const [tools, setTools] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("AG");
  const isEditing = useMemo(() => Boolean(selectedAgent && !selectedAgent.id.startsWith("default-")), [selectedAgent]);
  const customCreationLocked = userPlan === "free";
  const models = useMemo(() => getAgentModelOptions(userPlan), [userPlan]);

  useEffect(() => {
    if (!selectedAgent) {
      setName(defaultForm.name);
      setRole(defaultForm.role);
      setDescription(defaultForm.description);
      setSystemPrompt(defaultForm.systemPrompt);
      setModel(defaultForm.model);
      setTools(defaultForm.tools);
      setColor(defaultForm.color);
      setIcon(defaultForm.icon);
      return;
    }

    setName(selectedAgent.name);
    setRole(selectedAgent.role);
    setDescription(selectedAgent.description);
    setSystemPrompt(selectedAgent.systemPrompt);
    setModel(models.includes(selectedAgent.model) ? selectedAgent.model : models[0]);
    setTools(selectedAgent.tools.join(", "));
    setColor(selectedAgent.color);
    setIcon(selectedAgent.icon || "AG");
  }, [models, selectedAgent]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !role.trim()) return;
    const payload = {
      name,
      role,
      description,
      systemPrompt,
      model,
      tools: tools.split(",").map((item) => item.trim()).filter(Boolean),
      color,
      icon,
    };

    if (selectedAgent && !selectedAgent.id.startsWith("default-")) {
      await onUpdate(selectedAgent.id, payload);
    } else {
      await onCreate(payload);
    }

    onCancelEdit();
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-zinc-800 bg-[#1a1a2e] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            {isEditing ? "Configure Agent" : "Create Custom Agent"}
          </h2>
          <p className="text-sm text-zinc-400">
            {selectedAgent?.id.startsWith("default-")
              ? "Default agents can be reviewed here."
              : userPlan === "free"
                ? "Free plan: CEO, Manager, Tech Lead + 1 selected specialist. Upgrade to unlock custom agent creation."
                : "Set the role, prompt, model, and visual identity for this agent."}
          </p>
        </div>
        {selectedAgent ? (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Agent name" value={name} onChange={(event) => setName(event.target.value)} />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as AgentRole)}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          {roles.map((item) => (
            <option key={item} value={item}>
              {item.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <Input
        placeholder="Short description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <textarea
        placeholder="System prompt"
        value={systemPrompt}
        onChange={(event) => setSystemPrompt(event.target.value)}
        className="min-h-28 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
      />

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={model}
          onChange={(event) => setModel(event.target.value as Agent["model"])}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Input placeholder="Color" value={color} onChange={(event) => setColor(event.target.value)} />
        <Input placeholder="Icon label" value={icon} onChange={(event) => setIcon(event.target.value)} />
      </div>

      <Input
        placeholder="Tools (comma separated)"
        value={tools}
        onChange={(event) => setTools(event.target.value)}
      />

      <Button type="submit" disabled={customCreationLocked}>
        {isEditing ? "Save Agent" : selectedAgent?.id.startsWith("default-") ? "Create Custom Copy" : "Create Agent"}
      </Button>
    </form>
  );
}
