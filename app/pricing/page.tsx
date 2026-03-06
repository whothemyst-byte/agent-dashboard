"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getUser } from "@/lib/auth";

type Plan = {
  id: "FREE" | "PRO" | "AGENCY";
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    id: "FREE",
    title: "FREE",
    price: "₹0/month",
    features: [
      "5 tasks/month",
      "3 agents max (default only)",
      "Free AI models (Llama 3.3 70B · Qwen3 Coder · Mistral Small)",
      "No custom agents",
    ],
  },
  {
    id: "PRO",
    title: "PRO",
    price: "₹2,900/month",
    highlighted: true,
    features: [
      "100 tasks/month",
      "15 agents (including custom)",
      "Claude Haiku 4.5 via OpenRouter",
      "Task history (30 days)",
      "Priority support",
    ],
  },
  {
    id: "AGENCY",
    title: "AGENCY",
    price: "₹9,900/month",
    features: [
      "Unlimited tasks",
      "Unlimited custom agents",
      "Claude Sonnet 4.6 via OpenRouter",
      "Full task history + API access",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("demo-user-id");
  const [email, setEmail] = useState("demo@example.com");
  const [phone, setPhone] = useState("9999999999");
  const [name, setName] = useState("Demo User");
  const [loadingPlan, setLoadingPlan] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    getUser().then((user) => {
      if (!user) return;
      setUserId(user.id);
      if (user.email) setEmail(user.email);
    });
  }, []);

  const handleSubscribe = async (planId: string) => {
    const res = await fetch("/api/cashfree/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, userId, email, phone, name }),
    });
    const data = await res.json();

    const cashfree = await load({
      mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    });
    cashfree?.checkout({
      paymentSessionId: data.subscriptionSessionId,
      redirectTarget: "_self",
    });
  };

  const onPlanClick = async (planId: Plan["id"]) => {
    setError("");
    if (planId === "FREE") {
      router.push("/dashboard");
      return;
    }

    try {
      setLoadingPlan(planId);
      await handleSubscribe(planId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start subscription.");
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f1a] p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Choose your plan</h1>
          <p className="text-zinc-400">Upgrade anytime. Cancel when needed.</p>
        </header>

        <section className="mx-auto grid max-w-2xl grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-[#1a1a2e] p-4 md:grid-cols-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`rounded-2xl border-zinc-800 bg-[#1a1a2e] ${
                plan.highlighted ? "relative border-[#e8560a] shadow-[0_0_0_1px_rgba(232,86,10,0.4)]" : ""
              }`}
            >
              <CardHeader className="space-y-2">
                {plan.highlighted ? <Badge className="w-fit bg-[#e8560a] text-white">Most Popular</Badge> : null}
                <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                <p className="text-2xl font-black">{plan.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-zinc-300">
                  {plan.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => onPlanClick(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full ${
                    plan.id === "FREE"
                      ? "bg-zinc-700 hover:bg-zinc-600"
                      : "bg-[#e8560a] text-white hover:bg-[#ff6a1f]"
                  }`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : plan.id === "FREE"
                      ? "Start Free"
                      : plan.id === "PRO"
                        ? "Start Pro"
                        : "Start Agency"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
      </div>
    </main>
  );
}
