const CASHFREE_API_VERSION = "2025-01-01";

function getCashfreeBaseUrl() {
  return process.env.NODE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function getCashfreeHeaders() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) return null;

  return {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": appId,
    "x-client-secret": secretKey,
  };
}

async function parseResponse(response: Response) {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error_description === "string" && json.error_description) ||
      (typeof json?.error === "string" && json.error) ||
      `Cashfree API error ${response.status}`;
    throw new Error(details);
  }

  return json;
}

export async function createCashfreeSubscription(body: Record<string, unknown>) {
  const headers = getCashfreeHeaders();
  if (!headers) throw new Error("Missing billing configuration");

  const response = await fetch(`${getCashfreeBaseUrl()}/subscriptions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  return parseResponse(response);
}

export async function cancelCashfreeSubscription(subscriptionId: string) {
  const headers = getCashfreeHeaders();
  if (!headers) throw new Error("Missing billing configuration");

  const response = await fetch(
    `${getCashfreeBaseUrl()}/subscriptions/${encodeURIComponent(subscriptionId)}/manage`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        subscription_id: subscriptionId,
        action: "CANCEL",
      }),
    }
  );

  return parseResponse(response);
}
