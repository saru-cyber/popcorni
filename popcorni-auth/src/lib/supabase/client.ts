import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AUTH,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/config/constants";
import { isRecord } from "@/lib/guards";
import { getSharedSupabaseOptions } from "@/lib/supabase/options";

type MirroredCookie = {
  name: string;
  value: string;
};

type CookieWrite = {
  name: string;
  value: string;
  options: {
    domain?: string;
    path?: string;
    maxAge?: number;
    expires?: Date;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
  };
};

const memoryMirror = new Map<string, string>();
let browserClient: SupabaseClient | null = null;

function loadPersistentMirror(): Map<string, string> {
  const map = new Map<string, string>();
  if (typeof window === "undefined") return map;
  try {
    const raw = window.localStorage.getItem(AUTH.cookieMirrorKey);
    if (!raw) return map;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return map;
    for (const entry of parsed) {
      if (!isRecord(entry)) continue;
      if (typeof entry.name !== "string" || typeof entry.value !== "string") {
        continue;
      }
      map.set(entry.name, entry.value);
    }
  } catch {
    return map;
  }
  return map;
}

function savePersistentMirror(map: Map<string, string>): void {
  if (typeof window === "undefined") return;
  const payload: MirroredCookie[] = Array.from(map, ([name, value]) => ({
    name,
    value,
  }));
  try {
    window.localStorage.setItem(AUTH.cookieMirrorKey, JSON.stringify(payload));
  } catch {
    // OBS private mode can reject localStorage. Memory mirror still covers this tab.
  }
}

function readDocumentCookies(): Map<string, string> {
  const map = new Map<string, string>();
  if (typeof document === "undefined" || !document.cookie) return map;
  for (const part of document.cookie.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const rawValue = part.slice(index + 1).trim();
    if (!name) continue;
    try {
      map.set(name, decodeURIComponent(rawValue));
    } catch {
      map.set(name, rawValue);
    }
  }
  return map;
}

function sameSiteDirective(
  sameSite: CookieWrite["options"]["sameSite"],
): string | null {
  if (sameSite === true) return "SameSite=Strict";
  if (sameSite === false || sameSite === undefined) return null;
  const label = sameSite.charAt(0).toUpperCase() + sameSite.slice(1);
  return `SameSite=${label}`;
}

function writeDocumentCookie(cookie: CookieWrite): void {
  const { name, value, options } = cookie;
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? AUTH.cookiePath}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (typeof options.maxAge === "number") parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  const sameSite = sameSiteDirective(options.sameSite);
  if (sameSite) parts.push(sameSite);
  if (options.secure) parts.push("Secure");
  try {
    document.cookie = parts.join("; ");
  } catch {
    // Cookie writes can throw in locked embedded browsers.
  }
}

function mergedCookies(): MirroredCookie[] {
  const map = loadPersistentMirror();
  for (const [name, value] of memoryMirror) map.set(name, value);
  for (const [name, value] of readDocumentCookies()) map.set(name, value);
  return Array.from(map, ([name, value]) => ({ name, value }));
}

function applyCookieWrites(cookiesToSet: CookieWrite[]): void {
  const persistent = loadPersistentMirror();
  for (const cookie of cookiesToSet) {
    writeDocumentCookie(cookie);
    if (cookie.value) {
      memoryMirror.set(cookie.name, cookie.value);
      persistent.set(cookie.name, cookie.value);
    } else {
      memoryMirror.delete(cookie.name);
      persistent.delete(cookie.name);
    }
  }
  savePersistentMirror(persistent);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;

  const shared = getSharedSupabaseOptions();
  browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieEncoding: shared.cookieEncoding,
    cookieOptions: shared.cookieOptions,
    isSingleton: true,
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
    cookies: {
      getAll() {
        return mergedCookies();
      },
      setAll(cookiesToSet) {
        applyCookieWrites(cookiesToSet);
      },
    },
  });

  return browserClient;
}
