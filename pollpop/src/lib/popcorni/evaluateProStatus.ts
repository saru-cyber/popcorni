import type { Profile } from "@/lib/popcorni/profile";

/**
 * Pro is active only when `is_pro` is true and `pro_expires_at` is still in
 * the future. A null expiry means the flag is open-ended. An invalid or past
 * timestamp fails closed, even if the boolean is still true.
 */
export function evaluateIsPro(
  profile: Profile | null,
  nowMs: number = Date.now(),
): boolean {
  if (!profile?.is_pro) return false;
  if (profile.pro_expires_at === null) return true;
  const expiresMs = Date.parse(profile.pro_expires_at);
  if (Number.isNaN(expiresMs)) return false;
  return nowMs < expiresMs;
}

export type PollProFeatures = {
  isPro: boolean;
  premiumWinnerFx: boolean;
  multipleActivePolls: boolean;
};

/** PollPop features unlocked by an active Popcorni Pro subscription. */
export function evaluatePollProFeatures(isPro: boolean): PollProFeatures {
  return {
    isPro,
    premiumWinnerFx: isPro,
    multipleActivePolls: isPro,
  };
}
