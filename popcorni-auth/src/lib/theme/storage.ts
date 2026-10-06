import { DEFAULT_THEME_ID, THEME } from "@/config/constants";
import { isPopcorniThemeId } from "@/config/popcorniThemes";
import type { PopcorniThemeId } from "@/types/theme";

function readThemeCookie(): PopcorniThemeId | null {
  if (typeof document === "undefined") return null;
  const prefix = `${THEME.storageKey}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) continue;
    const raw = trimmed.slice(prefix.length);
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    return isPopcorniThemeId(value) ? value : null;
  }
  return null;
}

/** Cookie is shared across localhost ports, so sibling apps can follow this portal. */
export function writeThemeCookie(id: PopcorniThemeId): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME.storageKey}=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function readStoredThemeId(): PopcorniThemeId | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME.storageKey);
    if (value && isPopcorniThemeId(value)) return value;
  } catch {
    // Private mode can block localStorage; the shared cookie still applies.
  }
  return readThemeCookie();
}

export function writeStoredThemeId(id: PopcorniThemeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME.storageKey, id);
  } catch {
    // Ignore quota or private-mode failures.
  }
  writeThemeCookie(id);
  window.dispatchEvent(new Event(THEME.changeEvent));
}

export function subscribeThemeStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const notify = () => onStoreChange();
  window.addEventListener(THEME.changeEvent, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(THEME.changeEvent, notify);
    window.removeEventListener("storage", notify);
  };
}

export function getThemeSnapshot(): PopcorniThemeId {
  return readStoredThemeId() ?? DEFAULT_THEME_ID;
}

export function getThemeServerSnapshot(): PopcorniThemeId {
  return DEFAULT_THEME_ID;
}
