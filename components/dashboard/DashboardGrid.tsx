import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Throughput</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          1,240 tasks processed in the last 24 hours.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Latency</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Average response time is 420 ms across active agents.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Failures</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          6 tasks need retry due to upstream timeout errors.
        </CardContent>
      </Card>
    </div>
  );
}
