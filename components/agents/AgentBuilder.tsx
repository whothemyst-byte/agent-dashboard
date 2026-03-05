"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AgentRole } from "@/lib/types";

type AgentBuilderProps = {
  onCreate: (payload: { name: string; role: AgentRole }) => Promise<unknown>;
};

export function AgentBuilder({ onCreate }: AgentBuilderProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !role.trim()) return;
    await onCreate({ name, role: role as AgentRole });
    setName("");
    setRole("");
  };

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
      <Input
        placeholder="Agent name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        placeholder="Role"
        value={role}
        onChange={(event) => setRole(event.target.value)}
      />
      <Button type="submit">Create Agent</Button>
    </form>
  );
}
