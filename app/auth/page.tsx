"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, resendVerificationEmail, signIn, signUp } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site-url";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let resolvedPath = "/dashboard";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      resolvedPath = params.get("next") || "/dashboard";
      setNextPath(resolvedPath);
      const authError = params.get("error");
      if (authError === "verification_failed") {
        setError("That email confirmation link is invalid or has expired. Request a new sign up link.");
      } else if (authError === "missing_config") {
        setError("Supabase auth is not configured correctly for this deployment.");
      }
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error_description");
      if (hashError) setError(hashError.replace(/\+/g, " "));
    }
    getUser().then((user) => {
      if (user) router.push(resolvedPath);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signin") {
        await signIn(email, password);
        router.push(nextPath);
      } else {
        const data = await signUp(email, password);
        if (!data.session) {
          setNotice(`Verification email sent to ${email}. Check your inbox, confirm the link, then sign in.`);
          setMode("signin");
          setPassword("");
          return;
        }
        router.push(nextPath);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Authentication failed.";
      if (message.toLowerCase().includes("email not confirmed")) {
        setNotice("Your email is not verified yet. Use resend verification email below.");
      } else if (message.toLowerCase().includes("rate limit")) {
        setError("Too many attempts. Please wait a minute before requesting another verification email.");
        setResendCooldown(60);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendCooldown > 0) return;
    setResendLoading(true);
    setError("");
    try {
      await resendVerificationEmail(email);
      setNotice(`Verification email re-sent to ${email}.`);
      setResendCooldown(60);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to resend verification email.";
      if (message.toLowerCase().includes("rate limit")) {
        setError("Verification email rate limit reached. Please wait before trying again.");
        setResendCooldown(60);
      } else {
        setError(message);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const continueWithGoogle = async () => {
    setError("");
    const redirectTo = `${getSiteUrl()}/dashboard`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <main className="relative min-h-screen overflow-hidden space-bg flex items-center justify-center p-4">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#e8560a]/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-700/8 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/5 blur-[80px]" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#e8560a]/30"
            style={{
              left: `${8 + i * 8}%`,
              top: `${15 + (i % 4) * 20}%`,
              animation: `floatUp ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#e8560a] to-[#ff8c00] shadow-[0_0_32px_rgba(232,86,10,0.5)]">
            <span className="text-2xl font-black text-white tracking-tighter">AO</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">AgentOS</h1>
            <p className="text-sm text-zinc-500">Multi-agent command center</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="glass-card rounded-2xl p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-zinc-900/60 p-1">
            {(["signin", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${mode === tab
                    ? "bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] text-white shadow-[0_2px_12px_rgba(232,86,10,0.4)]"
                    : "text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                {tab === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 backdrop-blur-sm transition focus:border-[#e8560a] focus:outline-none focus:ring-1 focus:ring-[#e8560a]/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 backdrop-blur-sm transition focus:border-[#e8560a] focus:outline-none focus:ring-1 focus:ring-[#e8560a]/50"
              />
            </div>

            {notice && (
              <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 px-4 py-3">
                <p className="text-sm text-emerald-400">{notice}</p>
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#e8560a] to-[#ff6a1f] py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(232,86,10,0.35)] transition hover:shadow-[0_4px_24px_rgba(232,86,10,0.5)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Please wait...
                </span>
              ) : mode === "signin" ? (
                "Sign In →"
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">
              Didn&apos;t get the verification email?
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={!email || resendLoading || resendCooldown > 0}
              className="mt-2 text-xs font-semibold text-[#e8560a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendLoading
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend verification email"}
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-600">or continue with</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <button
            type="button"
            onClick={continueWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/50 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/60 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-xs text-zinc-600">
            Secure · Encrypted · Private
          </p>
        </div>
      </div>
    </main>
  );
}
