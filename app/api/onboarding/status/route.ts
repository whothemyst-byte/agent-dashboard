import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseAdminClient } from "@/lib/server-security";
import { getBackboneRoles } from "@/lib/default-agents";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing Supabase admin configuration" }, { status: 500 });
  }

  let detailsCompleted = false;
  const { data: detailsRow, error: detailsError } = await supabaseAdmin
    .from("user_onboarding_profiles")
    .select("name, organization, purpose")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!detailsError && detailsRow) {
    detailsCompleted = Boolean(detailsRow.name && detailsRow.organization && detailsRow.purpose);
  }

  const backboneRoles = getBackboneRoles();
  const { data: backboneRows } = await supabaseAdmin
    .from("agents")
    .select("role")
    .eq("user_id", user.id)
    .in("role", backboneRoles)
    .eq("is_default", true);

  const roleSet = new Set((backboneRows ?? []).map((row: { role: string }) => row.role));
  const backboneReady = backboneRoles.every((role) => roleSet.has(role));

  return NextResponse.json({
    detailsCompleted,
    agentSelectionCompleted: backboneReady,
    needsOnboarding: !detailsCompleted || !backboneReady,
  });
}
