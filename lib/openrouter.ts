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
    analysis: "anthropic/claude-sonnet-4-6",
    ceo: "anthropic/claude-sonnet-4-6",
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
  const tier: Plan = plan === "agency" ? "agency" : plan === "pro" ? "pro" : "free";

  if (role === "ceo") {
    return MODELS[tier].ceo ?? MODELS[tier].general;
  }

  if (role === "coder" || role === "tech_lead" || role === "qa") {
    return MODELS[tier].coding;
  }

  if (role === "analyst") {
    return MODELS[tier].analysis;
  }

  return MODELS[tier].general;
}
