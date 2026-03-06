"use client";

import { useState, useCallback, useRef } from "react";
import { AgentOutput } from "@/lib/types";

export function useTaskStream() {
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const runTask = useCallback(async (task: string, userId: string) => {
    setIsRunning(true);
    setOutputs([]);
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setIsRunning(false);
      return;
    }

    const response = await fetch(
      apiUrl + "/api/tasks/run",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, user_id: userId }),
      },
    );

    if (!response.ok || !response.body) {
      setError(`Task launch failed (${response.status}).`);
      setIsRunning(false);
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n\n").filter((l) => l.startsWith("data:"));

      for (const line of lines) {
        try {
          const json = JSON.parse(line.replace("data: ", ""));
          if (json.type === "agent_update" && json.data) {
            const agentKey = Object.keys(json.data)[0];
            if (agentKey) {
              setActiveAgent(agentKey);
              const agentData = json.data[agentKey];
              if (agentData?.messages) {
                const lastMsg = agentData.messages[agentData.messages.length - 1];
                if (lastMsg) {
                  setOutputs((prev) => [
                    ...prev,
                    {
                      agentId: agentKey,
                      agentName: lastMsg.agent,
                      agentRole: lastMsg.agent,
                      content: lastMsg.output,
                      timestamp: new Date().toISOString(),
                      tokensUsed: 0,
                    },
                  ]);
                }
              }
            }
          }
          if (json.type === "complete") setIsRunning(false);
          if (json.type === "error") {
            setError(json.message);
            setIsRunning(false);
          }
        } catch (e) {}
      }
    }
    setIsRunning(false);
  }, []);

  const stopTask = useCallback(() => {
    eventSourceRef.current?.close();
    setIsRunning(false);
  }, []);

  return { isRunning, outputs, activeAgent, error, runTask, stopTask };
}
