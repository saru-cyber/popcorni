import {
  isPopcorniThemeId,
  resolveActiveThemeId,
} from "@/config/popcorniThemes";
import { DEFAULT_THEME_ID, THEME } from "@/lib/popcorni/constants";
import type { PopcorniThemeId } from "@/types/popcorniTheme";

export function readQueryThemeId(): PopcorniThemeId | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(THEME.queryKey);
  return value && isPopcorniThemeId(value) ? value : null;
}

export function readPremiumQuery(): boolean {
  if (typeof window === "undefined") return false;
  return (
    new URLSearchParams(window.location.search).get(THEME.premiumQueryKey) ===
    "1"
  );
}

/**
 * Vote and OBS viewers often do not share the streamer's localStorage.
 * A `pc_theme` query pin (copied from admin) wins, then this browser's
 * Popcorni theme, then the poll's own theme when it matches the catalog.
 */
export function resolveSharedThemeId(input: {
  pinnedId: string | null;
  storedId: PopcorniThemeId | null;
  pollThemeId?: string | null;
  isPro: boolean;
  authLoading: boolean;
}): PopcorniThemeId {
  if (input.pinnedId && isPopcorniThemeId(input.pinnedId)) {
    return input.pinnedId;
  }
  if (input.storedId) {
    return resolveActiveThemeId({
      storedId: input.storedId,
      authLoading: input.authLoading,
      isPro: input.isPro,
    });
  }
  if (input.pollThemeId && isPopcorniThemeId(input.pollThemeId)) {
    return input.pollThemeId;
  }
  return DEFAULT_THEME_ID;
}

export function appendThemeQuery(
  url: string,
  themeId: PopcorniThemeId,
  premium: boolean,
): string {
  if (!url) return url;
  const next = new URL(url);
  next.searchParams.set(THEME.queryKey, themeId);
  if (premium) next.searchParams.set(THEME.premiumQueryKey, "1");
  else next.searchParams.delete(THEME.premiumQueryKey);
  return next.toString();
}
