"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOnboardingStatus } from "@/lib/onboarding";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const user = await getUser();
        if (!active) return;

        if (!user) {
          router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (pathname !== "/onboarding") {
          const onboarding = await getOnboardingStatus();
          if (onboarding?.needsOnboarding) {
            router.replace("/onboarding");
            return;
          }
        }

        setStatus("allowed");
      } catch {
        if (!active) return;
        router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
      }
    }

    checkUser();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (status === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0f0f1a] text-zinc-100">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e8560a]" />
          <p className="text-sm text-zinc-400">Checking your session...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
