import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { HANDOFF } from "@/config/constants";

/**
 * Cross-origin session handoff uses the URL fragment so tokens are not sent
 * to servers or written into query logs. Only allowlisted return origins
 * receive this URL.
 */
export function appendSessionHandoff(target: URL, session: Session): string {
  const hash = new URLSearchParams();
  hash.set(HANDOFF.typeKey, HANDOFF.sessionType);
  hash.set(HANDOFF.accessTokenKey, session.access_token);
  hash.set(HANDOFF.refreshTokenKey, session.refresh_token);
  hash.set(HANDOFF.expiresInKey, String(session.expires_in ?? ""));
  hash.set(HANDOFF.tokenTypeKey, HANDOFF.bearer);
  const next = new URL(target.toString());
  next.hash = hash.toString();
  return next.toString();
}

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
