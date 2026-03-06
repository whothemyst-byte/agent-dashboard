import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseAdminClient } from "@/lib/server-security";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing Supabase admin configuration" }, { status: 500 });
  }

  const body = (await req.json()) as {
    name?: string;
    organization?: string;
    purpose?: string;
  };

  const name = body.name?.trim() ?? "";
  const organization = body.organization?.trim() ?? "";
  const purpose = body.purpose?.trim() ?? "";

  if (!name || !organization || !purpose) {
    return NextResponse.json(
      { error: "Name, organization, and purpose are required" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("user_onboarding_profiles").upsert(
    {
      user_id: user.id,
      name,
      organization,
      purpose,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
