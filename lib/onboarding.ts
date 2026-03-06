import { supabase } from "@/lib/supabase";

export type OnboardingStatus = {
  detailsCompleted: boolean;
  agentSelectionCompleted: boolean;
  needsOnboarding: boolean;
};

export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/onboarding/status", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    });

    if (!response.ok) return null;
    return (await response.json()) as OnboardingStatus;
  } catch {
    return null;
  }
}
