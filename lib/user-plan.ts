import { supabase } from "@/lib/supabase";
import type { Agent, User } from "@/lib/types";
import { getDefaultRoleSet } from "@/lib/default-agents";

export type UserPlan = User["plan"];

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const { data, error } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return "free";
  }

  return (data?.plan as UserPlan | undefined) ?? "free";
}

export function getAgentModelOptions(plan: UserPlan): Agent["model"][] {
  if (plan === "agency" || plan === "enterprise") {
    return [
      "anthropic/claude-haiku-4-5",
      "anthropic/claude-sonnet-4-6",
    ];
  }

  if (plan === "pro") {
    return ["anthropic/claude-haiku-4-5"];
  }

  return [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen3-coder:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
  ];
}

export function getTaskModelOptions(plan: UserPlan) {
  if (plan === "agency" || plan === "enterprise") {
    return [
      { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
    ];
  }

  if (plan === "pro") {
    return [{ value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" }];
  }

  return [
    { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B" },
    { value: "qwen/qwen3-coder:free", label: "Qwen3 Coder" },
    { value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small" },
  ];
}

export function isModelAvailableForPlan(plan: UserPlan, model: Agent["model"]) {
  return getAgentModelOptions(plan).includes(model);
}

export { getDefaultRoleSet };
