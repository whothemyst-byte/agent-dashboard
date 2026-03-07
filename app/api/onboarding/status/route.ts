import { NextResponse } from "next/server";
import { getAuthenticatedUser, getUserScopedSupabaseClient } from "@/lib/server-security";
import { getBackboneRoles } from "@/lib/default-agents";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getUserScopedSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const { data: detailsRow, error: detailsError } = await supabase
    .from("user_onboarding_profiles")
    .select("name, organization, purpose, details_completed, agent_selection_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (detailsError) {
    return NextResponse.json({ error: detailsError.message }, { status: 500 });
  }

  const backboneRoles = getBackboneRoles();

  // Check backbone agent existence (used both as fallback for agentSelection
  // and as a bypass for users who pre-date the onboarding profile system).
  const { data: backboneAgents, error: backboneError } = await supabase
    .from("agents")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .in("role", backboneRoles);

  if (backboneError) {
    return NextResponse.json({ error: backboneError.message }, { status: 500 });
  }

  const existingBackboneRoles = new Set(
    (backboneAgents ?? []).map((row: { role: string }) => row.role)
  );
  const hasAllBackboneAgents = backboneRoles.every((role) =>
    existingBackboneRoles.has(role)
  );

  // If the user has no onboarding profile row at all but already has backbone
  // agents, they're an existing user — treat them as fully onboarded so they
  // are never redirected to /onboarding.
  if (!detailsRow && hasAllBackboneAgents) {
    return NextResponse.json({
      detailsCompleted: true,
      agentSelectionCompleted: true,
      needsOnboarding: false,
    });
  }

  const detailsCompleted = Boolean(
    detailsRow?.details_completed ||
    (detailsRow?.name && detailsRow?.organization && detailsRow?.purpose)
  );
  const agentSelectionCompleted =
    Boolean(detailsRow?.agent_selection_completed) || hasAllBackboneAgents;

  return NextResponse.json({
    detailsCompleted,
    agentSelectionCompleted,
    needsOnboarding: !detailsCompleted || !agentSelectionCompleted,
  });
}
