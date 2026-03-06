import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
    "X-Title": "AgentOS",
  },
});

export const MODELS = {
  free: {
    general: "meta-llama/llama-3.3-70b-instruct:free",
    coding: "qwen/qwen3-coder:free",
    analysis: "mistralai/mistral-small-3.1-24b-instruct:free",
  },
  pro: {
    general: "anthropic/claude-haiku-4-5",
    coding: "anthropic/claude-haiku-4-5",
    analysis: "anthropic/claude-haiku-4-5",
    ceo: "anthropic/claude-haiku-4-5",
  },
  agency: {
    general: "anthropic/claude-haiku-4-5",
    coding: "anthropic/claude-sonnet-4-6",
    analysis: "anthropic/claude-sonnet-4-6",
    ceo: "anthropic/claude-sonnet-4-6",
  },
} as const;

type Plan = keyof typeof MODELS;
type Role =
  | "ceo"
  | "manager"
  | "tech_lead"
  | "researcher"
  | "analyst"
  | "coder"
  | "writer"
  | "qa"
  | "custom";

export function getModel(plan: string, role: Role) {
  const tier: Plan = plan === "agency" || plan === "enterprise" ? "agency" : plan === "pro" ? "pro" : "free";
  const config = MODELS[tier];

  if (role === "ceo") {
    return "ceo" in config ? config.ceo : config.general;
  }

  if (role === "coder" || role === "tech_lead" || role === "qa") {
    return config.coding;
  }

  if (role === "analyst") {
    return config.analysis;
  }

  return config.general;
}
