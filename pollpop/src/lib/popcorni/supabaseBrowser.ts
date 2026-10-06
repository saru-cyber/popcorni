import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AUTH } from "@/lib/popcorni/constants";

let browserClient: SupabaseClient | null = null;

/**
 * Browser client that shares the Popcorni auth cookie (`popcorni-auth-token`)
 * with the portal on localhost. Cookie host matching ignores the port, so a
 * session established on :3003 is visible here.
 */
export function getPopcorniBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !anonKey) return null;

  const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();
  browserClient = createBrowserClient(url, anonKey, {
    cookieEncoding: AUTH.cookieEncoding,
    isSingleton: true,
    cookieOptions: {
      name: AUTH.cookieName,
      path: AUTH.cookiePath,
      sameSite: AUTH.cookieSameSite,
      secure: window.location.protocol === "https:",
      ...(domain ? { domain } : {}),
    },
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}
