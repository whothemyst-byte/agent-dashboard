import { Cashfree } from 'cashfree-pg';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { subscriptionId } = await req.json();
  const CF = Cashfree as any;
  CF.XClientId = process.env.CASHFREE_APP_ID!;
  CF.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
  CF.XEnvironment = CF?.Environment?.PRODUCTION ?? 'PRODUCTION';

  await CF.PGSubscriptionCancel('2025-01-01', subscriptionId);
  return NextResponse.json({ cancelled: true });
}
