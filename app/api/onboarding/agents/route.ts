import { NextResponse } from "next/server";
import { getAuthenticatedUser, getUserScopedSupabaseClient } from "@/lib/server-security";
import { getBackboneDefaults, getBackboneRoles, getDefaultRoleSet } from "@/lib/default-agents";
import { getModel } from "@/lib/model-routing";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getUserScopedSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const body = (await req.json()) as { selectedAgentIds?: string[] };
  const selectedAgentIds = Array.isArray(body.selectedAgentIds) ? body.selectedAgentIds : [];

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan = (planRow?.plan as string | undefined) ?? "free";

  const allDefaults = getDefaultRoleSet();
  const backbone = getBackboneDefaults();
  const backboneRoles = new Set(getBackboneRoles());
  const optionalDefaults = allDefaults.filter((item) => !backboneRoles.has(item.role));

  const optionalSelection = optionalDefaults.filter((item) => selectedAgentIds.includes(item.id));
  if (plan === "free" && optionalSelection.length !== 1) {
    return NextResponse.json(
      { error: "Free plan requires selecting exactly one additional default agent." },
      { status: 400 }
    );
  }

  const effectiveOptionalSelection =
    plan === "free" ? optionalSelection : optionalDefaults;

  const expectedRoles = new Set([
    ...backbone.map((item) => item.role),
    ...effectiveOptionalSelection.map((item) => item.role),
  ]);

  const { data: existingAgents } = await supabase
    .from("agents")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .in("role", [...expectedRoles]);

  const existingRoles = new Set((existingAgents ?? []).map((row: { role: string }) => row.role));
  const toInsert = [...backbone, ...effectiveOptionalSelection].filter((item) => !existingRoles.has(item.role));

  if (toInsert.length > 0) {
    const payload = toInsert.map((item) => ({
      user_id: user.id,
      name: item.name,
      role: item.role,
      description: item.description,
      system_prompt: item.systemPrompt,
      model: getModel(plan, item.role),
      tools: [],
      status: "idle",
      last_output: "",
      color: item.color,
      icon: item.icon,
      is_default: true,
    }));

    const { error: insertError } = await supabase.from("agents").insert(payload);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  if (plan === "free") {
    const selectedOptionalRoles = new Set(effectiveOptionalSelection.map((item) => item.role));
    const removableOptionalRoles = optionalDefaults
      .filter((item) => !selectedOptionalRoles.has(item.role))
      .map((item) => item.role);

    if (removableOptionalRoles.length > 0) {
      await supabase
        .from("agents")
        .delete()
        .eq("user_id", user.id)
        .eq("is_default", true)
        .in("role", removableOptionalRoles);
    }
  }

  const { error: markError } = await supabase
    .from("user_onboarding_profiles")
    .update({
      agent_selection_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (markError) {
    return NextResponse.json({ error: markError.message }, { status: 500 });
  }

  return NextResponse.json({
    saved: true,
    guaranteedBackbone: backbone.map((item) => item.role),
    selectedOptionalRoles: effectiveOptionalSelection.map((item) => item.role),
  });
}
