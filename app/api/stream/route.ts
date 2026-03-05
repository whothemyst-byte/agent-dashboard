export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let interval: NodeJS.Timeout | undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const payload = `event:${Date.now()} Agent heartbeat received`;
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      send();
      interval = setInterval(send, 3000);
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    },
  });
}
