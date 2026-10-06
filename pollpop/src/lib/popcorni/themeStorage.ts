import { THEME } from "@/lib/popcorni/constants";
import { isPopcorniThemeId } from "@/config/popcorniThemes";
import type { PopcorniThemeId } from "@/types/popcorniTheme";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) continue;
    const raw = trimmed.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

/** Portal cookie wins so a theme change on :3003 reaches this origin. */
export function readSharedThemeId(): PopcorniThemeId | null {
  if (typeof window === "undefined") return null;
  const fromCookie = readCookie(THEME.storageKey);
  if (fromCookie && isPopcorniThemeId(fromCookie)) return fromCookie;
  try {
    const stored = window.localStorage.getItem(THEME.storageKey);
    if (stored && isPopcorniThemeId(stored)) return stored;
  } catch {
    return null;
  }
  return null;
}

export function subscribeSharedTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const notify = () => onStoreChange();
  window.addEventListener("focus", notify);
  window.addEventListener("visibilitychange", notify);
  window.addEventListener("storage", notify);
  window.addEventListener(THEME.changeEvent, notify);
  const timer = window.setInterval(notify, 1500);
  return () => {
    window.removeEventListener("focus", notify);
    window.removeEventListener("visibilitychange", notify);
    window.removeEventListener("storage", notify);
    window.removeEventListener(THEME.changeEvent, notify);
    window.clearInterval(timer);
  };
}
