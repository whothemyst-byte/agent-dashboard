"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp } from "@/lib/auth";
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
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNextPath(params.get("next") || "/dashboard");
      const authError = params.get("error");
      if (authError === "verification_failed") {
        setError("That email confirmation link is invalid or has expired. Request a new sign up link.");
      }
      if (authError === "missing_config") {
        setError("Supabase auth is not configured correctly for this deployment.");
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error_description");
      if (hashError) {
        setError(hashError.replace(/\+/g, " "));
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push(nextPath);
    });
  }, [nextPath, router]);

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
          setNotice(
            `Verification email sent to ${email}. Check your inbox, confirm the link, then sign in.`,
          );
          setMode("signin");
          setPassword("");
          return;
        }
        router.push(nextPath);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setLoading(false);
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
    <main className="min-h-screen bg-[#0f0f1a] p-4 text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-md place-items-center">
        <Card className="w-full rounded-2xl border-zinc-800 bg-[#1a1a2e] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#e8560a] text-xl font-black text-white">
              A
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              AgentOS
            </CardTitle>
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900/70">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="border-zinc-700 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="border-zinc-700 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500"
              />
              {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e8560a] text-white hover:bg-[#ff6a1f]"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Sign Up"}
              </Button>
            </form>

            <div className="my-4 h-px bg-zinc-800" />

            <Button
              type="button"
              variant="outline"
              onClick={continueWithGoogle}
              className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900"
            >
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
