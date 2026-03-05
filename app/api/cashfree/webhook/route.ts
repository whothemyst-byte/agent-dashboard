import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');

  const signedPayload = timestamp + rawBody;
  const expectedSig = crypto
    .createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET!)
    .update(signedPayload)
    .digest('base64');

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.type;
  const subData = event.data?.subscription_details;
  const custData = event.data?.customer_details;

  if (eventType === 'SUBSCRIPTION_STATUS') {
    const status = subData?.subscription_status;
    const userId = custData?.customer_id;

    if (status === 'ACTIVE') {
      const planId = subData?.plan_details?.plan_id;
      const plan = planId === process.env.CASHFREE_AGENCY_PLAN_ID ? 'agency' : 'pro';
      await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan,
          subscription_id: subData.subscription_id,
          updated_at: new Date().toISOString(),
        });
    }

    if (status === 'CANCELLED' || status === 'EXPIRED') {
      await supabase
        .from('user_plans')
        .upsert({ user_id: userId, plan: 'free', updated_at: new Date().toISOString() });
    }
  }

  if (eventType === 'SUBSCRIPTION_PAYMENT_FAILED') {
    console.log('Payment failed for subscription:', subData?.subscription_id);
  }

  return NextResponse.json({ received: true });
}
