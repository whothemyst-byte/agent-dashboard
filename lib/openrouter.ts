import OpenAI from "openai";
import { MODELS, getModel } from "@/lib/model-routing";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
    "X-Title": "AgentOS",
  },
});

export { MODELS, getModel };
