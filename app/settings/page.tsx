import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="workspace">Workspace Name</Label>
          <Input id="workspace" placeholder="Agent Ops Workspace" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="alerts">Enable task alerts</Label>
          <Switch id="alerts" defaultChecked />
        </div>
      </section>
    </main>
  );
}
