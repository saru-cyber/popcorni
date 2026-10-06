"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getThemeSurfaces,
  POPCORNI_THEMES,
  resolveActiveThemeId,
} from "@/config/popcorniThemes";
import { DEFAULT_THEME_ID } from "@/lib/popcorni/constants";
import { readSharedThemeId, subscribeSharedTheme } from "@/lib/popcorni/themeStorage";
import { usePopcorniSession } from "@/components/popcorni/PopcorniSessionProvider";
import type { PopcorniTheme, PopcorniThemeId, ThemeSurfaces } from "@/types/popcorniTheme";

export type PopcorniThemeContextValue = {
  storedId: PopcorniThemeId | null;
  themeId: PopcorniThemeId;
  theme: PopcorniTheme;
  surfaces: ThemeSurfaces;
};

const PopcorniThemeContext = createContext<PopcorniThemeContextValue | null>(
  null,
);

function getStoredSnapshot(): PopcorniThemeId | null {
  return readSharedThemeId();
}

function getStoredServerSnapshot(): PopcorniThemeId | null {
  return null;
}

export function PopcorniThemeProvider({ children }: { children: ReactNode }) {
  const { isPro, isLoading } = usePopcorniSession();
  const storedId = useSyncExternalStore(
    subscribeSharedTheme,
    getStoredSnapshot,
    getStoredServerSnapshot,
  );
  const themeId = resolveActiveThemeId({
    storedId: storedId ?? DEFAULT_THEME_ID,
    authLoading: isLoading,
    isPro,
  });
  const theme = POPCORNI_THEMES[themeId];
  const surfaces = useMemo(() => getThemeSurfaces(theme), [theme]);

  const value = useMemo<PopcorniThemeContextValue>(
    () => ({
      storedId,
      themeId,
      theme,
      surfaces,
    }),
    [storedId, themeId, theme, surfaces],
  );

  return (
    <PopcorniThemeContext.Provider value={value}>
      {children}
    </PopcorniThemeContext.Provider>
  );
}

export function usePopcorniTheme(): PopcorniThemeContextValue {
  const value = useContext(PopcorniThemeContext);
  if (!value) {
    throw new Error(
      "usePopcorniTheme must be used within PopcorniThemeProvider",
    );
  }
  return value;
}
