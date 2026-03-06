export type OnboardingStatus = {
  detailsCompleted: boolean;
  agentSelectionCompleted: boolean;
  needsOnboarding: boolean;
};

export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  try {
    const response = await fetch("/api/onboarding/status", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as OnboardingStatus;
  } catch {
    return null;
  }
}
