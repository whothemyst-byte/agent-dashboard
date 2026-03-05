"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AgentChat() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    setHistory((prev) => [`You: ${message}`, ...prev]);
    setMessage("");
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Agent Chat</h2>
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Send a message..."
        />
        <Button type="submit">Send</Button>
      </form>
      <div className="space-y-1 text-sm text-muted-foreground">
        {history.length === 0 ? <p>No messages yet.</p> : null}
        {history.map((entry) => (
          <p key={entry}>{entry}</p>
        ))}
      </div>
    </section>
  );
}
