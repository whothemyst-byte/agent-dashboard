import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdminClient } from '@/lib/server-security';

export async function POST(req: Request) {
  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
  const agencyPlanId = process.env.CASHFREE_AGENCY_PLAN_ID;
  if (!webhookSecret || !agencyPlanId) {
    return NextResponse.json({ error: 'Missing webhook configuration' }, { status: 500 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Missing Supabase admin configuration' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');
  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 401 });
  }

  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs)) {
    return NextResponse.json({ error: 'Invalid webhook timestamp' }, { status: 401 });
  }

  const maxSkewMs = 5 * 60 * 1000;
  const now = Date.now();
  if (Math.abs(now - timestampMs) > maxSkewMs) {
    return NextResponse.json({ error: 'Webhook timestamp outside allowed window' }, { status: 401 });
  }

  const signedPayload = timestamp + rawBody;
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('base64');

  const expectedBuffer = Buffer.from(expectedSig, 'base64');
  const signatureBuffer = Buffer.from(signature, 'base64');

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
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
      const plan = planId === agencyPlanId ? 'agency' : 'pro';
      await supabaseAdmin
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan,
          subscription_id: subData.subscription_id,
          updated_at: new Date().toISOString(),
        });
    }

    if (status === 'CANCELLED' || status === 'EXPIRED') {
      await supabaseAdmin
        .from('user_plans')
        .upsert({ user_id: userId, plan: 'free', updated_at: new Date().toISOString() });
    }
  }

  if (eventType === 'SUBSCRIPTION_PAYMENT_FAILED') {
    console.log('Payment failed for subscription:', subData?.subscription_id);
  }

  return NextResponse.json({ received: true });
}
