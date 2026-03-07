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

  const detailsCompleted = Boolean(
    detailsRow?.details_completed ||
    (detailsRow?.name && detailsRow?.organization && detailsRow?.purpose)
  );
  let agentSelectionCompleted = Boolean(detailsRow?.agent_selection_completed);

  if (!agentSelectionCompleted) {
    const backboneRoles = getBackboneRoles();
    const { data: backboneAgents, error: backboneError } = await supabase
      .from("agents")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .in("role", backboneRoles);

    if (backboneError) {
      return NextResponse.json({ error: backboneError.message }, { status: 500 });
    }

    const existingBackboneRoles = new Set((backboneAgents ?? []).map((row: { role: string }) => row.role));
    agentSelectionCompleted = backboneRoles.every((role) => existingBackboneRoles.has(role));
  }

  return NextResponse.json({
    detailsCompleted,
    agentSelectionCompleted,
    needsOnboarding: !detailsCompleted || !agentSelectionCompleted,
  });
}
