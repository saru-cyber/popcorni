import { DEFAULT_THEME_ID, THEME } from "@/config/constants";
import { isPopcorniThemeId } from "@/config/popcorniThemes";
import type { PopcorniThemeId } from "@/types/theme";

export function readStoredThemeId(): PopcorniThemeId | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME.storageKey);
    if (value && isPopcorniThemeId(value)) return value;
  } catch {
    return null;
  }
  return null;
}

export function writeStoredThemeId(id: PopcorniThemeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME.storageKey, id);
  } catch {
    // Ignore quota or private-mode failures.
  }
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
