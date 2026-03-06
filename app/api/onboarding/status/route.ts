import { NextResponse } from "next/server";
import { getAuthenticatedUser, getUserScopedSupabaseClient } from "@/lib/server-security";
import { getBackboneRoles, getDefaultRoleSet } from "@/lib/default-agents";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getUserScopedSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  let detailsCompleted = false;
  const { data: detailsRow, error: detailsError } = await supabase
    .from("user_onboarding_profiles")
    .select("name, organization, purpose")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!detailsError && detailsRow) {
    detailsCompleted = Boolean(detailsRow.name && detailsRow.organization && detailsRow.purpose);
  }

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan = (planRow?.plan as string | undefined) ?? "free";

  const backboneRoles = getBackboneRoles();
  const { data: defaultRows } = await supabase
    .from("agents")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_default", true);

  const roleSet = new Set((defaultRows ?? []).map((row: { role: string }) => row.role));
  const backboneReady = backboneRoles.every((role) => roleSet.has(role));
  const backboneRoleSet = new Set<string>(backboneRoles);
  const optionalCount = [...roleSet].filter((role) => !backboneRoleSet.has(role)).length;
  const allDefaultRoles = getDefaultRoleSet().map((item) => item.role);

  const agentSelectionCompleted =
    plan === "free"
      ? backboneReady && optionalCount >= 1
      : allDefaultRoles.every((role) => roleSet.has(role));

  return NextResponse.json({
    detailsCompleted,
    agentSelectionCompleted,
    needsOnboarding: !detailsCompleted || !agentSelectionCompleted,
  });
}
