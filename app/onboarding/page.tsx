"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/user-plan";
import { getDefaultRoleSet, getBackboneRoles } from "@/lib/default-agents";
import { getOnboardingStatus } from "@/lib/onboarding";

type Step = "details" | "agents";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("details");
  const [plan, setPlan] = useState<"free" | "pro" | "agency" | "enterprise">("free");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAgentPopup, setShowAgentPopup] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allDefaults = useMemo(() => getDefaultRoleSet(), []);
  const backboneRoles = useMemo(() => new Set(getBackboneRoles()), []);
  const backboneAgents = allDefaults.filter((item) => backboneRoles.has(item.role));
  const optionalAgents = allDefaults.filter((item) => !backboneRoles.has(item.role));

  useEffect(() => {
    async function bootstrap() {
      const user = await getUser();
      if (!user) {
        router.replace("/auth?next=/onboarding");
        return;
      }

      const userPlan = await getUserPlan(user.id);
      setPlan(userPlan);

      const status = await getOnboardingStatus();
      if (status?.needsOnboarding === false) {
        router.replace("/dashboard");
        return;
      }

      if (status?.detailsCompleted) {
        setStep("agents");
      } else {
        setStep("details");
      }

      setLoading(false);
    }

    bootstrap();
  }, [router]);

  async function handleSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/onboarding/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, organization, purpose }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save details.");
      }
      setStep("agents");
      setShowAgentPopup(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save details.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteAgents() {
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/onboarding/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ selectedAgentIds: selectedIds }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save agent selection.");
      }

      setShowAgentPopup(false);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save agent selection.");
    } finally {
      setSaving(false);
    }
  }

  function toggleAgent(agentId: string) {
    if (plan === "free") return;
    setSelectedIds((current) =>
      current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId]
    );
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center space-bg text-zinc-100">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e8560a]" />
          <p className="text-sm text-zinc-400">Preparing onboarding...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-bg p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="glass-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">First-time setup</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-100">Welcome to AgentOS</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Flow: details, agent selection, then dashboard.
          </p>
        </header>

        {step === "details" ? (
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-zinc-100">Tell us about you</h2>
            <p className="mt-1 text-sm text-zinc-400">
              We use this to personalize your onboarding and route tasks better.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSaveDetails}>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Carter"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500" htmlFor="org">
                  Organization
                </label>
                <input
                  id="org"
                  className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  placeholder="Acme Labs"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500" htmlFor="purpose">
                  Primary purpose
                </label>
                <textarea
                  id="purpose"
                  className="min-h-[120px] w-full rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="What do you want to achieve using AgentOS?"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Continue to agent selection"}
              </button>
            </form>
          </section>
        ) : (
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-zinc-100">Agent selection</h2>
            <p className="mt-1 text-sm text-zinc-400">
              CEO, Manager, and Tech Lead are always available on every plan.
            </p>
            <button
              type="button"
              onClick={() => setShowAgentPopup(true)}
              className="mt-4 rounded-xl bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-4 py-2.5 text-sm font-bold text-white"
            >
              Open selection popup
            </button>
            {error ? (
              <div className="mt-4 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </section>
        )}
      </div>

      {showAgentPopup ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-zinc-700/60 bg-[#121222] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-100">Select agents</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Backbone agents are locked-in and always active for your workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentPopup(false)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Always included</p>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                {backboneAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-[#e8560a]/50 bg-[#e8560a]/10 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-zinc-100">{agent.name}</p>
                      <span className="rounded-full bg-zinc-900/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300">
                        Locked
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-300">{agent.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Optional default agents</p>
              {plan === "free" ? (
                <p className="mt-2 rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-3 text-sm text-zinc-400">
                  Free plan includes the 3 backbone agents by default. Upgrade to unlock additional default agents.
                </p>
              ) : (
                <p className="mt-2 text-sm text-zinc-400">
                  Pick any additional default agents for your initial workspace.
                </p>
              )}

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {optionalAgents.map((agent) => {
                  const selected = selectedIds.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => toggleAgent(agent.id)}
                      disabled={plan === "free"}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#e8560a] bg-[#e8560a]/10"
                          : "border-zinc-800/60 bg-zinc-950/30"
                      } ${plan === "free" ? "cursor-not-allowed opacity-60" : "hover:border-zinc-600"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-100">{agent.name}</span>
                        <span className="text-xs uppercase text-zinc-500">{agent.role}</span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-400">{agent.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCompleteAgents}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Continue to dashboard"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
