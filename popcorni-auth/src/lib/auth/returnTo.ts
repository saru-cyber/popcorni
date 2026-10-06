import type { Session } from "@supabase/supabase-js";
import {
  AUTH,
  getAllowedReturnOrigins,
  getBrowserSiteUrl,
  getConfiguredSiteUrl,
  ROUTES,
} from "@/config/constants";
import { appendSessionHandoff } from "@/lib/auth/sessionHandoff";

function normalizeOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, "");
  }
}

function allowedOrigins(): Set<string> {
  const origins = new Set<string>(
    getAllowedReturnOrigins().map((origin) => normalizeOrigin(origin)),
  );
  origins.add(normalizeOrigin(getBrowserSiteUrl()));
  origins.add(normalizeOrigin(getConfiguredSiteUrl()));
  return origins;
}

export function sanitizeReturnTo(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/")) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!allowedOrigins().has(url.origin)) return null;
  return url.toString();
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) continue;
    try {
      return decodeURIComponent(trimmed.slice(prefix.length));
    } catch {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

function writeReturnCookie(value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH.returnToCookie}=${encodeURIComponent(value)}; Path=${AUTH.cookiePath}; Max-Age=${AUTH.returnToMaxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearReturnCookie(): void {
  document.cookie = `${AUTH.returnToCookie}=; Path=${AUTH.cookiePath}; Max-Age=0; SameSite=Lax`;
}

export function rememberReturnTo(value: string): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeReturnTo(value);
  if (!safe) return;
  try {
    window.sessionStorage.setItem(AUTH.returnToStorageKey, safe);
  } catch {
    // Session storage can be blocked in private embedded browsers.
  }
  writeReturnCookie(safe);
}

export function peekReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(AUTH.returnToStorageKey);
  } catch {
    stored = null;
  }
  const value = stored || readCookie(AUTH.returnToCookie);
  if (!value) return null;
  return sanitizeReturnTo(value);
}

export function consumeReturnTo(): string | null {
  const value = peekReturnTo();
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(AUTH.returnToStorageKey);
    } catch {
      // Ignore storage failures while clearing.
    }
    clearReturnCookie();
  }
  return value;
}

export function resolvePostLoginLocation(
  returnTo: string | null,
  session: Session | null,
): string {
  if (!returnTo) return ROUTES.home;
  const safe = sanitizeReturnTo(returnTo);
  if (!safe) return ROUTES.home;
  if (safe.startsWith("/")) return safe;

  let url: URL;
  try {
    url = new URL(safe);
  } catch {
    return ROUTES.home;
  }

  const own = new Set([
    normalizeOrigin(getBrowserSiteUrl()),
    normalizeOrigin(getConfiguredSiteUrl()),
  ]);
  if (own.has(url.origin)) return `${url.pathname}${url.search}`;
  if (!session) return ROUTES.home;
  return appendSessionHandoff(url, session);
}

export function buildOAuthRedirectUrl(): string {
  return `${getBrowserSiteUrl()}${ROUTES.callback}`;
}
