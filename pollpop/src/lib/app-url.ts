/**
 * Public site origin for share links, QR codes, and OBS URLs.
 * Prefer NEXT_PUBLIC_APP_URL (e.g. https://pollpop-ruddy.vercel.app),
 * otherwise fall back to the current browser origin.
 */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function getConfiguredAppUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  return normalizeBaseUrl(raw);
}

export function getAppBaseUrl(): string {
  const configured = getConfiguredAppUrl();
  if (configured) return configured;
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
