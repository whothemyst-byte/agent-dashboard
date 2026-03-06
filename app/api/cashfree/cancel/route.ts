import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdminClient } from '@/lib/server-security';
import { cancelCashfreeSubscription } from '@/lib/cashfree';

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ cancelled: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { subscriptionId } = await req.json();
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    return NextResponse.json({ cancelled: false, error: 'Invalid subscriptionId' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ cancelled: false, error: 'Missing Supabase admin configuration' }, { status: 500 });
  }

  const { data: planRow, error: planError } = await supabaseAdmin
    .from('user_plans')
    .select('subscription_id')
    .eq('user_id', user.id)
    .single();

  if (planError) {
    return NextResponse.json({ cancelled: false, error: 'Unable to validate subscription ownership' }, { status: 403 });
  }

  if (!planRow?.subscription_id || planRow.subscription_id !== subscriptionId) {
    return NextResponse.json({ cancelled: false, error: 'Subscription does not belong to current user' }, { status: 403 });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    return NextResponse.json({ cancelled: false, error: 'Missing billing configuration' }, { status: 500 });
  }

  try {
    await cancelCashfreeSubscription(subscriptionId);
    return NextResponse.json({ cancelled: true });
  } catch (error: any) {
    return NextResponse.json({ cancelled: false, error: error?.message ?? 'Cancel failed' }, { status: 500 });
  }
}
