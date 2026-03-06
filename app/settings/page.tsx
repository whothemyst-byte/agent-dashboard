import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen space-bg p-6 text-zinc-100">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold text-zinc-100">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8560a]/20 text-[#e8560a]">
                <SettingsIcon className="h-4 w-4" />
              </span>
              Settings
            </h1>
          </div>

          <section className="glass-card space-y-5 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Workspace</h2>
            <div className="space-y-1.5">
              <Label htmlFor="workspace" className="text-xs font-medium uppercase tracking-wider text-zinc-500">Workspace Name</Label>
              <Input
                id="workspace"
                placeholder="Agent Ops Workspace"
                className="border-zinc-700/60 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-600 focus:border-[#e8560a] focus:ring-1 focus:ring-[#e8560a]/30"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-4">
              <div>
                <Label htmlFor="alerts" className="text-sm font-semibold text-zinc-200">Task Alerts</Label>
                <p className="text-xs text-zinc-500 mt-0.5">Receive notifications when tasks complete</p>
              </div>
              <Switch id="alerts" defaultChecked />
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
