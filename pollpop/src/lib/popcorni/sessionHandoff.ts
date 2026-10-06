import type { SupabaseClient } from "@supabase/supabase-js";
import { HANDOFF } from "@/lib/popcorni/constants";

/** Reads the fragment written by popcorni-auth after a cross-origin sign-in. */
export async function consumeSessionHandoff(
  supabase: SupabaseClient,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (params.get(HANDOFF.typeKey) !== HANDOFF.sessionType) return false;

  const accessToken = params.get(HANDOFF.accessTokenKey);
  const refreshToken = params.get(HANDOFF.refreshTokenKey);
  if (!accessToken || !refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", nextUrl);
  return !error;
}
