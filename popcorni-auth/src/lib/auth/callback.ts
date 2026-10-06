import type { Session } from "@supabase/supabase-js";
import {
  consumeReturnTo,
  peekReturnTo,
  resolvePostLoginLocation,
} from "@/lib/auth/returnTo";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * A finished code exchange is success when Supabase returns no error, or when
 * a session is already stored (the code can be rejected after the session exists).
 */
export function isOAuthExchangeSuccess(
  error: unknown,
  session: Session | null,
): boolean {
  return error == null || session != null;
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
