"use client";

import { useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { getThemeSurfaces, POPCORNI_THEMES } from "@/config/popcorniThemes";
import { usePopcorniSession } from "@/components/popcorni/PopcorniSessionProvider";
import { usePopcorniTheme } from "@/components/popcorni/PopcorniThemeProvider";
import { ThemeParticles } from "@/components/popcorni/ThemeParticles";
import { resolveSharedThemeId } from "@/lib/popcorni/screenTheme";
import type { PopcorniTheme, ThemeSurfaces } from "@/types/popcorniTheme";

function subscribeQuery() {
  return () => {};
}

function readPinnedTheme(): string | null {
  return new URLSearchParams(window.location.search).get("pc_theme");
}

function readPinnedServer(): string | null {
  return null;
}

export function useSharedPopcorniTheme(pollThemeId?: string | null): {
  theme: PopcorniTheme;
  surfaces: ThemeSurfaces;
} {
  const { isPro, isLoading } = usePopcorniSession();
  const account = usePopcorniTheme();
  const pinnedId = useSyncExternalStore(
    subscribeQuery,
    readPinnedTheme,
    readPinnedServer,
  );
  const themeId = resolveSharedThemeId({
    pinnedId,
    storedId: account.storedId,
    pollThemeId,
    isPro,
    authLoading: isLoading,
  });
  const theme = POPCORNI_THEMES[themeId];
  const surfaces = useMemo(() => getThemeSurfaces(theme), [theme]);
  return { theme, surfaces };
}

function obsStyle(theme: PopcorniTheme): CSSProperties {
  const light = theme.appearance === "light";
  return {
    background: "transparent",
    backgroundImage: "none",
    color: light ? theme.colors.foreground : "#fafafa",
    ["--pc-accent" as string]: theme.colors.accent,
    ["--pc-glow" as string]: theme.effects.hoverGlow,
    ["--pc-border" as string]: theme.colors.cardBorder,
    fontFamily: "var(--font-body), system-ui, sans-serif",
  };
}

export function PopcorniScreen({
  mode,
  source = mode === "obs" ? "shared" : "account",
  pollThemeId,
  className = "",
  children,
}: {
  mode: "app" | "obs";
  /** Account theme follows the signed-in portal choice. Shared follows the URL pin, then that choice, then the poll theme. */
  source?: "account" | "shared";
  pollThemeId?: string | null;
  className?: string;
  children: ReactNode;
}) {
  const shared = useSharedPopcorniTheme(pollThemeId);
  const account = usePopcorniTheme();
  const theme = source === "shared" ? shared.theme : account.theme;
  const surfaces = source === "shared" ? shared.surfaces : account.surfaces;
  const style = mode === "obs" ? obsStyle(theme) : surfaces.page;

  return (
    <div
      className={`popcorni-screen relative ${mode === "obs" ? "min-h-screen bg-transparent" : "min-h-full"} ${className}`}
      style={style}
      data-popcorni-theme={theme.id}
      data-popcorni-mode={mode}
    >
      {mode === "app" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: theme.effects.atmosphere,
            backgroundSize: theme.effects.atmosphereSize,
          }}
        />
      ) : null}
      <ThemeParticles theme={theme} />
      <div className={`relative z-10 ${mode === "obs" ? "" : "min-h-full"}`}>
        {children}
      </div>
    </div>
  );
}

export function obsTextShadow(theme: PopcorniTheme): string {
  if (theme.appearance === "light") {
    return "0 1px 2px rgba(255,255,255,0.95), 0 0 14px rgba(255,255,255,0.72)";
  }
  return "0 2px 8px rgba(0,0,0,0.88)";
}

export function chartChrome(theme: PopcorniTheme) {
  const light = theme.appearance === "light";
  return {
    label: theme.colors.foreground,
    meta: theme.colors.muted,
    track: light ? "rgba(24,24,27,0.08)" : "rgba(255,255,255,0.14)",
    empty: theme.colors.muted,
    accent: theme.colors.accent,
  };
}

export function obsChartChrome(theme: PopcorniTheme) {
  const light = theme.appearance === "light";
  return {
    label: light ? theme.colors.foreground : "#fafafa",
    meta: light ? theme.colors.muted : "rgba(255,255,255,0.88)",
    track: "transparent",
    empty: light ? theme.colors.muted : "rgba(255,255,255,0.72)",
    shadow: obsTextShadow(theme),
    accent: theme.colors.accent,
  };
}
