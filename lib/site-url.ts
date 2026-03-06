export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_URL?.trim();

  if (envUrl) {
    try {
      // Normalize to origin in case env var was configured with a path.
      return new URL(envUrl).origin.replace(/\/$/, "");
    } catch {
      return envUrl.replace(/\/$/, "");
    }
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
