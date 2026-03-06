import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-security';
import { createCashfreeSubscription } from '@/lib/cashfree';

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const rawSiteUrl = process.env.NEXT_PUBLIC_URL;
  const proPlanId = process.env.CASHFREE_PRO_PLAN_ID;
  const agencyPlanId = process.env.CASHFREE_AGENCY_PLAN_ID;

  if (!appId || !secretKey || !rawSiteUrl || !proPlanId || !agencyPlanId) {
    return NextResponse.json({ success: false, error: 'Missing billing configuration' }, { status: 500 });
  }
  const siteUrl = new URL(rawSiteUrl).origin;

  const { planId, email, phone, name } = await req.json();
  const safePlanId = planId === 'AGENCY' ? 'AGENCY' : planId === 'PRO' ? 'PRO' : null;
  if (!safePlanId) {
    return NextResponse.json({ success: false, error: 'Invalid planId' }, { status: 400 });
  }

  const subscriptionId = 'sub_' + user.id + '_' + Date.now();

  const planMap: Record<string, string> = {
    PRO: proPlanId,
    AGENCY: agencyPlanId,
  };

  const request = {
    subscription_id: subscriptionId,
    plan_id: planMap[safePlanId],
    customer_details: {
      customer_id: user.id,
      customer_email: email,
      customer_phone: phone,
      customer_name: name,
    },
    authorization_details: {
      authorization_amount: 2,
    },
    subscription_meta: {
      return_url: siteUrl + '/dashboard?sub_success=true&sub_id=' + subscriptionId,
      notify_url: siteUrl + '/api/cashfree/webhook',
    },
  };

  try {
    const data = await createCashfreeSubscription(request);
    const subscriptionSessionId = data?.subscription_session_id ?? data?.data?.subscription_session_id;
    if (!subscriptionSessionId) {
      return NextResponse.json({ success: false, error: 'Missing subscription session id from provider' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      subscriptionSessionId,
      subscriptionId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
