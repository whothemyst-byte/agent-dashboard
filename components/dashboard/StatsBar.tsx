import { Bot, CheckCircle2, Clock3 } from "lucide-react";

const stats = [
  { label: "Active Agents", value: "12", icon: Bot },
  { label: "Queued Tasks", value: "48", icon: Clock3 },
  { label: "Completed Today", value: "193", icon: CheckCircle2 },
];

export function StatsBar() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-lg border p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
