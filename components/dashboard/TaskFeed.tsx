const feed = [
  "Agent Alpha completed summarization task #A-938.",
  "Agent Delta started ingestion task #I-211.",
  "Agent Sigma retried task #R-014 after timeout.",
];

export function TaskFeed() {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Task Feed</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {feed.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
