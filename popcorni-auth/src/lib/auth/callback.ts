import { AUTH_COPY } from "@/config/constants";
import {
  consumeReturnTo,
  peekReturnTo,
  resolvePostLoginLocation,
} from "@/lib/auth/returnTo";
import { publishSessionChanged } from "@/lib/auth/sessionChannel";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const inflight = new Map<string, Promise<string>>();

export function completeOAuthCallback(code: string): Promise<string> {
  const existing = inflight.get(code);
  if (existing) return existing;

  const promise = (async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error(AUTH_COPY.notConfigured);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    const { data } = await supabase.auth.getSession();
    const returnTo = consumeReturnTo();
    publishSessionChanged();
    return resolvePostLoginLocation(returnTo, data.session);
  })();

  inflight.set(code, promise);
  return promise;
}

export async function continueToReturnTarget(): Promise<void> {
  const returnTo = peekReturnTo();
  if (!returnTo || typeof window === "undefined") return;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const target = resolvePostLoginLocation(returnTo, data.session);
  consumeReturnTo();
  const current = `${window.location.pathname}${window.location.search}`;
  if (target === current) return;
  window.location.assign(target);
}
