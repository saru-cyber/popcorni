import type { CSSProperties } from "react";

export const POPCORNI_THEME_IDS = [
  "light",
  "dark",
  "animal_race",
  "game",
  "party",
  "idol_stage",
  "neon_live",
  "pastel_pop",
  "retro_show",
] as const;

export type PopcorniThemeId = (typeof POPCORNI_THEME_IDS)[number];

export type ThemeTier = "free" | "pro";

export type ThemeAppearance = "light" | "dark";

export type ThemeColors = {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  accentForeground: string;
  card: string;
  cardBorder: string;
  buttonForeground: string;
  scrim: string;
  logoPlate: string;
  danger: string;
};

export type ThemeGradients = {
  page: string;
  card: string;
  button: string;
  badge: string;
};

export type ThemeEffects = {
  cardShadow: string;
  buttonShadow: string;
  hoverGlow: string;
  sheen: string;
  blur: string;
  atmosphere: string;
  atmosphereSize: string;
};

export type ThemeVfxParticles = {
  enabled: boolean;
  symbols: readonly string[];
  count: number;
  color: string;
  speedMs: number;
  sizeRem: number;
  driftPx: number;
};

export type PopcorniTheme = {
  id: PopcorniThemeId;
  name: string;
  description: string;
  tier: ThemeTier;
  proOnly: boolean;
  appearance: ThemeAppearance;
  colors: ThemeColors;
  gradient: ThemeGradients;
  effects: ThemeEffects;
  vfx: ThemeVfxParticles;
};

export type ThemeSurfaces = {
  page: CSSProperties;
  card: CSSProperties;
  title: CSSProperties;
  muted: CSSProperties;
  accent: CSSProperties;
  button: CSSProperties;
  buttonSecondary: CSSProperties;
  input: CSSProperties;
  badge: CSSProperties;
  proBadge: CSSProperties;
  lock: CSSProperties;
  overlay: CSSProperties;
  modal: CSSProperties;
  logoPlate: CSSProperties;
  error: CSSProperties;
};
