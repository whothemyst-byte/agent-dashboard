import { Cashfree } from 'cashfree-pg';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const CF = Cashfree as any;
  CF.XClientId = process.env.CASHFREE_APP_ID!;
  CF.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
  CF.XEnvironment =
    process.env.NODE_ENV === 'production'
      ? CF?.Environment?.PRODUCTION ?? 'PRODUCTION'
      : CF?.Environment?.SANDBOX ?? 'SANDBOX';

  const { planId, userId, email, phone, name } = await req.json();

  const subscriptionId = 'sub_' + userId + '_' + Date.now();

  const planMap: Record<string, string> = {
    PRO: process.env.CASHFREE_PRO_PLAN_ID!,
    AGENCY: process.env.CASHFREE_AGENCY_PLAN_ID!,
  };

  const request = {
    subscription_id: subscriptionId,
    plan_id: planMap[planId],
    customer_details: {
      customer_id: userId,
      customer_email: email,
      customer_phone: phone,
      customer_name: name,
    },
    authorization_details: {
      authorization_amount: 2,
    },
    subscription_meta: {
      return_url: process.env.NEXT_PUBLIC_URL + '/dashboard?sub_success=true&sub_id=' + subscriptionId,
      notify_url: process.env.NEXT_PUBLIC_URL + '/api/cashfree/webhook',
    },
  };

  try {
    const response = await CF.PGSubscriptionCreate('2025-01-01', request);
    const data = response.data;
    return NextResponse.json({
      success: true,
      subscriptionSessionId: data.subscription_session_id,
      subscriptionId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
