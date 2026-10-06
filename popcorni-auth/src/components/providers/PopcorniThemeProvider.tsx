"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePopcorniAuth } from "@/components/providers/PopcorniAuthProvider";
import {
  canUseTheme,
  getThemeSurfaces,
  listPopcorniThemes,
  POPCORNI_THEMES,
  resolveActiveThemeId,
} from "@/config/popcorniThemes";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  subscribeThemeStore,
  writeStoredThemeId,
} from "@/lib/theme/storage";
import type {
  PopcorniTheme,
  PopcorniThemeId,
  ThemeSurfaces,
} from "@/types/theme";

export type PopcorniThemeContextValue = {
  themeId: PopcorniThemeId;
  theme: PopcorniTheme;
  themes: readonly PopcorniTheme[];
  surfaces: ThemeSurfaces;
  setThemeId: (themeId: PopcorniThemeId) => void;
  isThemeUnlocked: (themeId: PopcorniThemeId) => boolean;
  upgradeModalOpen: boolean;
  upgradeTheme: PopcorniTheme | null;
  openUpgradeModal: (theme?: PopcorniTheme) => void;
  closeUpgradeModal: () => void;
};

const PopcorniThemeContext = createContext<PopcorniThemeContextValue | null>(
  null,
);

export function PopcorniThemeProvider({ children }: { children: ReactNode }) {
  const { isPro, isLoading } = usePopcorniAuth();
  const storedId = useSyncExternalStore(
    subscribeThemeStore,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTheme, setUpgradeTheme] = useState<PopcorniTheme | null>(null);
  const themes = useMemo(() => listPopcorniThemes(), []);
  const themeId = resolveActiveThemeId({
    storedId,
    authLoading: isLoading,
    isPro,
  });
  const theme = POPCORNI_THEMES[themeId];
  const surfaces = useMemo(() => getThemeSurfaces(theme), [theme]);

  const setThemeId = useCallback(
    (nextId: PopcorniThemeId) => {
      const next = POPCORNI_THEMES[nextId];
      if (!canUseTheme(next, isPro)) {
        setUpgradeTheme(next);
        setUpgradeModalOpen(true);
        return;
      }
      writeStoredThemeId(nextId);
      setUpgradeTheme(null);
    },
    [isPro],
  );

  const openUpgradeModal = useCallback((next?: PopcorniTheme) => {
    setUpgradeTheme(next ?? null);
    setUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(false);
  }, []);

  const isThemeUnlocked = useCallback(
    (id: PopcorniThemeId) => canUseTheme(id, isPro),
    [isPro],
  );

  const value = useMemo<PopcorniThemeContextValue>(
    () => ({
      themeId,
      theme,
      themes,
      surfaces,
      setThemeId,
      isThemeUnlocked,
      upgradeModalOpen,
      upgradeTheme,
      openUpgradeModal,
      closeUpgradeModal,
    }),
    [
      themeId,
      theme,
      themes,
      surfaces,
      setThemeId,
      isThemeUnlocked,
      upgradeModalOpen,
      upgradeTheme,
      openUpgradeModal,
      closeUpgradeModal,
    ],
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
