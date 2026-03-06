"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { getUser } from "@/lib/auth";
import { Check, ArrowLeft, Zap } from "lucide-react";

type Plan = {
  id: "FREE" | "PRO" | "AGENCY";
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    id: "FREE",
    title: "Free",
    price: "₹0",
    period: "/month",
    description: "Get started with AI agents",
    features: [
      "5 tasks/month",
      "3 agents max (default only)",
      "Llama 3.3 70B · Qwen3 Coder · Mistral Small",
      "No custom agents",
    ],
  },
  {
    id: "PRO",
    title: "Pro",
    price: "₹2,900",
    period: "/month",
    description: "For power users and teams",
    highlighted: true,
    badge: "Most Popular",
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
    title: "Agency",
    price: "₹9,900",
    period: "/month",
    description: "Unlimited power for agencies",
    features: [
      "Unlimited tasks",
      "Unlimited custom agents",
      "Claude Sonnet 4.6 + Haiku 4.5",
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
  const [showForm, setShowForm] = useState(false);

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
    cashfree?.checkout({ paymentSessionId: data.subscriptionSessionId, redirectTarget: "_self" });
  };

  const onPlanClick = async (planId: Plan["id"]) => {
    setError("");
    if (planId === "FREE") { router.push("/dashboard"); return; }
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
    <main className="min-h-screen space-bg p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8560a] to-[#ff8c00] shadow-[0_0_24px_rgba(232,86,10,0.4)]">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Choose your plan</h1>
          <p className="text-zinc-400">Upgrade anytime. Cancel when needed.</p>
        </div>

        {/* Payment info card */}
        <div className="glass-card mx-auto max-w-2xl rounded-2xl p-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex w-full items-center justify-between text-sm font-medium text-zinc-300"
          >
            <span>Payment details (Pre-fill for faster checkout)</span>
            <span className="text-zinc-500">{showForm ? "▲" : "▼"}</span>
          </button>
          {showForm && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { value: name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), placeholder: "Full Name" },
                { value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), placeholder: "Email" },
                { value: phone, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value), placeholder: "Phone" },
              ].map((field) => (
                <input
                  key={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#e8560a] focus:outline-none focus:ring-1 focus:ring-[#e8560a]/50"
                />
              ))}
            </div>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${plan.highlighted
                  ? "border-[#e8560a]/60 bg-gradient-to-b from-[#1a1a2e] to-[#1a0d2e] shadow-[0_0_40px_rgba(232,86,10,0.2)]"
                  : "glass-card hover:border-zinc-700/60"
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-4 py-1 text-xs font-bold text-white shadow-[0_2px_12px_rgba(232,86,10,0.4)]">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{plan.title}</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-black text-zinc-100">{plan.price}</span>
                  <span className="mb-1 text-sm text-zinc-500">{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onPlanClick(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full rounded-xl py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97] ${plan.id === "FREE"
                    ? "border border-zinc-700/60 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800/60"
                    : "bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] text-white shadow-[0_4px_16px_rgba(232,86,10,0.35)] hover:shadow-[0_4px_24px_rgba(232,86,10,0.5)]"
                  }`}
              >
                {loadingPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : plan.id === "FREE" ? (
                  "Get Started Free"
                ) : plan.id === "PRO" ? (
                  "Start Pro →"
                ) : (
                  "Start Agency →"
                )}
              </button>
            </div>
          ))}
        </div>

        {error ? (
          <div className="mx-auto max-w-md rounded-xl border border-red-800/40 bg-red-950/30 px-5 py-3 text-center text-sm text-red-400">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
