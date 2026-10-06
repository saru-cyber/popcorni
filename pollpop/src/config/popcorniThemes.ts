import type { CSSProperties } from "react";
import {
  DEFAULT_THEME_ID,
  THEME_CSS_VARS,
} from "@/lib/popcorni/constants";
import type {
  PopcorniTheme,
  PopcorniThemeId,
  ThemeAppearance,
  ThemeEffects,
  ThemeSurfaces,
  ThemeVfxParticles,
} from "@/types/popcorniTheme";
import { POPCORNI_THEME_IDS } from "@/types/popcorniTheme";

const CHROME = {
  light: {
    foreground: "#18181b",
    muted: "#52525b",
    card: "#ffffff",
    cardBorder: "rgba(24, 24, 27, 0.10)",
    input: "#f4f4f5",
    scrim: "rgba(24, 24, 27, 0.46)",
    danger: "#be123c",
    cardShadow: "0 1px 2px rgba(24, 24, 27, 0.05), 0 10px 28px rgba(24, 24, 27, 0.06)",
  },
  dark: {
    foreground: "#fafafa",
    muted: "#a1a1aa",
    card: "#18181b",
    cardBorder: "rgba(255, 255, 255, 0.10)",
    input: "#09090b",
    scrim: "rgba(0, 0, 0, 0.64)",
    danger: "#fda4af",
    cardShadow: "0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 32px rgba(0, 0, 0, 0.32)",
  },
} as const;

const QUIET_VFX: ThemeVfxParticles = {
  enabled: false,
  symbols: [],
  count: 0,
  color: "transparent",
  speedMs: 12000,
  sizeRem: 1,
  driftPx: 0,
};

type ThemeDraft = {
  id: PopcorniThemeId;
  name: string;
  description: string;
  proOnly: boolean;
  appearance: ThemeAppearance;
  background: string;
  accent: string;
  accentForeground: string;
  buttonForeground: string;
  logoPlate: string;
  page: string;
  button: string;
  badge: string;
  buttonShadow: string;
  hoverGlow: string;
  atmosphere: string;
  atmosphereSize: string;
  vfx: ThemeVfxParticles;
};

function defineTheme(draft: ThemeDraft): PopcorniTheme {
  const chrome = CHROME[draft.appearance];
  const effects: ThemeEffects = {
    cardShadow: chrome.cardShadow,
    buttonShadow: draft.buttonShadow,
    hoverGlow: draft.hoverGlow,
    sheen: "transparent",
    blur: "0px",
    atmosphere: draft.atmosphere,
    atmosphereSize: draft.atmosphereSize,
  };

  return {
    id: draft.id,
    name: draft.name,
    description: draft.description,
    tier: draft.proOnly ? "pro" : "free",
    proOnly: draft.proOnly,
    appearance: draft.appearance,
    colors: {
      background: draft.background,
      foreground: chrome.foreground,
      muted: chrome.muted,
      accent: draft.accent,
      accentForeground: draft.accentForeground,
      card: chrome.card,
      cardBorder: chrome.cardBorder,
      buttonForeground: draft.buttonForeground,
      scrim: chrome.scrim,
      logoPlate: draft.logoPlate,
      danger: chrome.danger,
    },
    gradient: {
      page: draft.page,
      card: "none",
      button: draft.button,
      badge: draft.badge,
    },
    effects,
    vfx: draft.vfx,
  };
}

const LIGHT = defineTheme({
  id: "light",
  name: "Light",
  description: "Clean daylight, quiet type, and a single ink accent.",
  proOnly: false,
  appearance: "light",
  background: "#fafafa",
  accent: "#18181b",
  accentForeground: "#fafafa",
  buttonForeground: "#fafafa",
  logoPlate: "rgba(24, 24, 27, 0.06)",
  page: "radial-gradient(ellipse 48% 36% at 0% 0%, rgba(24,24,27,0.06), transparent), linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)",
  button: "linear-gradient(90deg, #18181b 0%, #3f3f46 100%)",
  badge: "linear-gradient(90deg, #18181b 0%, #3f3f46 100%)",
  buttonShadow: "0 8px 18px rgba(24, 24, 27, 0.14)",
  hoverGlow: "0 12px 28px rgba(24, 24, 27, 0.16)",
  atmosphere: "radial-gradient(circle at 100% 0%, rgba(24,24,27,0.04), transparent 34%)",
  atmosphereSize: "auto",
  vfx: QUIET_VFX,
});

const DARK = defineTheme({
  id: "dark",
  name: "Dark",
  description: "Quiet night dashboard with zinc surfaces and a soft highlight.",
  proOnly: false,
  appearance: "dark",
  background: "#09090b",
  accent: "#fafafa",
  accentForeground: "#18181b",
  buttonForeground: "#18181b",
  logoPlate: "rgba(255, 255, 255, 0.08)",
  page: "radial-gradient(ellipse 46% 34% at 100% 0%, rgba(255,255,255,0.08), transparent), linear-gradient(180deg, #09090b 0%, #111113 100%)",
  button: "linear-gradient(90deg, #fafafa 0%, #e4e4e7 100%)",
  badge: "linear-gradient(90deg, #fafafa 0%, #d4d4d8 100%)",
  buttonShadow: "0 8px 18px rgba(0, 0, 0, 0.35)",
  hoverGlow: "0 12px 28px rgba(255, 255, 255, 0.12)",
  atmosphere: "radial-gradient(circle at 0% 100%, rgba(255,255,255,0.04), transparent 30%)",
  atmosphereSize: "auto",
  vfx: QUIET_VFX,
});

const ANIMAL_RACE = defineTheme({
  id: "animal_race",
  name: "Animal Race",
  description: "Meadow night race with lime light and animal confetti.",
  proOnly: false,
  appearance: "dark",
  background: "#0c1210",
  accent: "#a3e635",
  accentForeground: "#052e16",
  buttonForeground: "#052e16",
  logoPlate: "rgba(163, 230, 53, 0.14)",
  page: "radial-gradient(ellipse 42% 34% at 0% 0%, rgba(163,230,53,0.28), transparent), radial-gradient(ellipse 28% 24% at 100% 0%, rgba(251,191,36,0.16), transparent), linear-gradient(180deg, #0c1210 0%, #111311 100%)",
  button: "linear-gradient(90deg, #bef264 0%, #34d399 52%, #fbbf24 100%)",
  badge: "linear-gradient(90deg, #fde68a 0%, #bef264 100%)",
  buttonShadow: "0 10px 24px rgba(132, 204, 22, 0.28)",
  hoverGlow: "0 14px 32px rgba(163, 230, 53, 0.28)",
  atmosphere:
    "radial-gradient(circle at 12% 88%, rgba(163,230,53,0.14), transparent 24%), radial-gradient(circle at 88% 72%, rgba(251,191,36,0.1), transparent 22%)",
  atmosphereSize: "auto",
  vfx: {
    enabled: true,
    symbols: ["🦊", "🐶", "🐰", "🍃", "⭐"],
    count: 14,
    color: "#d9f99d",
    speedMs: 11000,
    sizeRem: 1.15,
    driftPx: 16,
  },
});

const GAME = defineTheme({
  id: "game",
  name: "Game",
  description: "Arcade cabinet glow, scoreboard lime, and a tight HUD grid.",
  proOnly: false,
  appearance: "dark",
  background: "#070b12",
  accent: "#84cc16",
  accentForeground: "#052e16",
  buttonForeground: "#052e16",
  logoPlate: "rgba(132, 204, 22, 0.14)",
  page: "radial-gradient(ellipse 36% 30% at 0% 0%, rgba(132,204,22,0.22), transparent), radial-gradient(ellipse 28% 24% at 100% 8%, rgba(250,204,21,0.12), transparent), linear-gradient(180deg, #070b12 0%, #0c1018 100%)",
  button: "linear-gradient(90deg, #84cc16 0%, #22c55e 46%, #facc15 100%)",
  badge: "linear-gradient(90deg, #bef264 0%, #facc15 100%)",
  buttonShadow: "0 10px 24px rgba(132, 204, 22, 0.3)",
  hoverGlow: "0 0 28px rgba(132, 204, 22, 0.35)",
  atmosphere:
    "linear-gradient(rgba(132,204,22,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.07) 1px, transparent 1px)",
  atmosphereSize: "28px 28px, 28px 28px",
  vfx: {
    enabled: true,
    symbols: ["🎮", "👾", "🕹️", "💎"],
    count: 12,
    color: "#bef264",
    speedMs: 9000,
    sizeRem: 1.05,
    driftPx: 12,
  },
});

const PARTY = defineTheme({
  id: "party",
  name: "Party",
  description: "Confetti night with balloons and a bright celebration button.",
  proOnly: false,
  appearance: "dark",
  background: "#120c14",
  accent: "#f472b6",
  accentForeground: "#3b0714",
  buttonForeground: "#3b0714",
  logoPlate: "rgba(244, 114, 182, 0.16)",
  page: "radial-gradient(ellipse 36% 32% at 0% 0%, rgba(244,114,182,0.28), transparent), radial-gradient(ellipse 30% 26% at 100% 0%, rgba(250,204,21,0.2), transparent), radial-gradient(ellipse 28% 24% at 80% 100%, rgba(103,232,249,0.16), transparent), linear-gradient(180deg, #120c14 0%, #0e0c12 100%)",
  button: "linear-gradient(90deg, #f472b6 0%, #facc15 52%, #67e8f9 100%)",
  badge: "linear-gradient(90deg, #f9a8d4 0%, #fde68a 100%)",
  buttonShadow: "0 10px 24px rgba(244, 114, 182, 0.28)",
  hoverGlow: "0 14px 32px rgba(250, 204, 21, 0.28)",
  atmosphere:
    "radial-gradient(circle at 8% 18%, rgba(244,114,182,0.16), transparent 18%), radial-gradient(circle at 92% 12%, rgba(250,204,21,0.14), transparent 16%), radial-gradient(circle at 70% 90%, rgba(103,232,249,0.12), transparent 18%)",
  atmosphereSize: "auto",
  vfx: {
    enabled: true,
    symbols: ["🎉", "🎊", "🎈", "✨"],
    count: 16,
    color: "#fbcfe8",
    speedMs: 10000,
    sizeRem: 1.15,
    driftPx: 20,
  },
});

const IDOL_STAGE = defineTheme({
  id: "idol_stage",
  name: "Idol Stage",
  description: "Spotlight pinks, gold dust, and stage sparkle.",
  proOnly: true,
  appearance: "dark",
  background: "#100c10",
  accent: "#fb7185",
  accentForeground: "#3b0714",
  buttonForeground: "#3b0714",
  logoPlate: "rgba(251, 113, 133, 0.16)",
  page: "radial-gradient(ellipse 40% 34% at 18% 0%, rgba(251,113,133,0.28), transparent), radial-gradient(ellipse 28% 24% at 82% 0%, rgba(251,191,36,0.18), transparent), linear-gradient(180deg, #100c10 0%, #0c0a0c 100%)",
  button: "linear-gradient(90deg, #fb7185 0%, #f472b6 48%, #fbbf24 100%)",
  badge: "linear-gradient(90deg, #fbcfe8 0%, #fde68a 100%)",
  buttonShadow: "0 12px 28px rgba(244, 114, 182, 0.32)",
  hoverGlow: "0 0 32px rgba(251, 113, 133, 0.4)",
  atmosphere:
    "radial-gradient(ellipse 14% 52% at 20% -8%, rgba(255,255,255,0.22), transparent 70%), radial-gradient(ellipse 12% 48% at 50% -6%, rgba(251,113,133,0.36), transparent 72%), radial-gradient(ellipse 14% 52% at 80% -8%, rgba(251,191,36,0.28), transparent 70%)",
  atmosphereSize: "auto",
  vfx: {
    enabled: true,
    symbols: ["✨", "💖", "🎤", "⭐", "🌸"],
    count: 16,
    color: "#fbcfe8",
    speedMs: 9000,
    sizeRem: 1.1,
    driftPx: 20,
  },
});

const NEON_LIVE = defineTheme({
  id: "neon_live",
  name: "Neon Live",
  description: "Cyan and magenta neon on a live black stage.",
  proOnly: true,
  appearance: "dark",
  background: "#07070d",
  accent: "#22d3ee",
  accentForeground: "#041016",
  buttonForeground: "#041016",
  logoPlate: "rgba(34, 211, 238, 0.14)",
  page: "radial-gradient(ellipse 40% 32% at 0% 0%, rgba(34,211,238,0.22), transparent), radial-gradient(ellipse 34% 28% at 100% 0%, rgba(232,121,249,0.2), transparent), linear-gradient(180deg, #07070d 0%, #0a0a12 100%)",
  button: "linear-gradient(90deg, #22d3ee 0%, #818cf8 50%, #e879f9 100%)",
  badge: "linear-gradient(90deg, #67e8f9 0%, #e879f9 100%)",
  buttonShadow: "0 0 24px rgba(34, 211, 238, 0.4)",
  hoverGlow: "0 0 28px rgba(34,211,238,0.45), 0 0 48px rgba(232,121,249,0.22)",
  atmosphere:
    "linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(232,121,249,0.07) 1px, transparent 1px)",
  atmosphereSize: "56px 56px, 56px 56px",
  vfx: {
    enabled: true,
    symbols: ["⚡", "✦", "◆", "💠"],
    count: 14,
    color: "#67e8f9",
    speedMs: 7000,
    sizeRem: 1.05,
    driftPx: 22,
  },
});

const PASTEL_POP = defineTheme({
  id: "pastel_pop",
  name: "Pastel Pop",
  description: "Soft peach, lavender, and mint pop.",
  proOnly: true,
  appearance: "light",
  background: "#fafafa",
  accent: "#c026d3",
  accentForeground: "#ffffff",
  buttonForeground: "#ffffff",
  logoPlate: "rgba(192, 38, 211, 0.1)",
  page: "radial-gradient(ellipse 42% 34% at 0% 0%, rgba(251,207,232,0.85), transparent), radial-gradient(ellipse 34% 28% at 100% 0%, rgba(186,230,253,0.75), transparent), radial-gradient(ellipse 30% 26% at 70% 100%, rgba(167,243,208,0.55), transparent), linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
  button: "linear-gradient(90deg, #f472b6 0%, #c084fc 55%, #67e8f9 100%)",
  badge: "linear-gradient(90deg, #f9a8d4 0%, #d8b4fe 100%)",
  buttonShadow: "0 12px 24px rgba(192, 132, 252, 0.24)",
  hoverGlow: "0 16px 32px rgba(192, 38, 211, 0.22)",
  atmosphere:
    "radial-gradient(circle at 8% 16%, rgba(244,114,182,0.2), transparent 22%), radial-gradient(circle at 92% 8%, rgba(125,211,252,0.22), transparent 20%), radial-gradient(circle at 74% 90%, rgba(167,243,208,0.2), transparent 22%)",
  atmosphereSize: "auto",
  vfx: {
    enabled: true,
    symbols: ["🌸", "🍬", "🫧", "☁️"],
    count: 12,
    color: "#e879f9",
    speedMs: 13000,
    sizeRem: 1.2,
    driftPx: 12,
  },
});

const RETRO_SHOW = defineTheme({
  id: "retro_show",
  name: "Retro Show",
  description: "Sunset amber, violet, and retro marquee glow.",
  proOnly: true,
  appearance: "dark",
  background: "#100e12",
  accent: "#fb923c",
  accentForeground: "#2a1206",
  buttonForeground: "#2a1206",
  logoPlate: "rgba(251, 146, 60, 0.16)",
  page: "radial-gradient(ellipse 40% 32% at 0% 0%, rgba(251,146,60,0.26), transparent), radial-gradient(ellipse 32% 28% at 100% 0%, rgba(168,85,247,0.22), transparent), linear-gradient(180deg, #100e12 0%, #0c0c10 100%)",
  button: "linear-gradient(90deg, #fb923c 0%, #f472b6 52%, #c084fc 100%)",
  badge: "linear-gradient(90deg, #fdba74 0%, #f9a8d4 100%)",
  buttonShadow: "0 12px 28px rgba(251, 146, 60, 0.3)",
  hoverGlow: "0 0 30px rgba(251, 146, 60, 0.36)",
  atmosphere:
    "repeating-linear-gradient(180deg, rgba(251,146,60,0.06) 0 1px, transparent 1px 7px), radial-gradient(ellipse at 50% 120%, rgba(251,146,60,0.18), transparent 46%)",
  atmosphereSize: "auto",
  vfx: {
    enabled: true,
    symbols: ["★", "📺", "🪩", "✴️"],
    count: 14,
    color: "#fdba74",
    speedMs: 10000,
    sizeRem: 1.1,
    driftPx: 18,
  },
});

export const POPCORNI_THEMES: Record<PopcorniThemeId, PopcorniTheme> = {
  light: LIGHT,
  dark: DARK,
  animal_race: ANIMAL_RACE,
  game: GAME,
  party: PARTY,
  idol_stage: IDOL_STAGE,
  neon_live: NEON_LIVE,
  pastel_pop: PASTEL_POP,
  retro_show: RETRO_SHOW,
};

export function isPopcorniThemeId(value: string): value is PopcorniThemeId {
  return (POPCORNI_THEME_IDS as readonly string[]).includes(value);
}

export function listPopcorniThemes(): readonly PopcorniTheme[] {
  return POPCORNI_THEME_IDS.map((id) => POPCORNI_THEMES[id]);
}

export function canUseTheme(
  theme: PopcorniTheme | PopcorniThemeId,
  isPro: boolean,
): boolean {
  const resolved = typeof theme === "string" ? POPCORNI_THEMES[theme] : theme;
  if (!resolved.proOnly) return true;
  return isPro;
}

export function resolveActiveThemeId(input: {
  storedId: PopcorniThemeId;
  authLoading: boolean;
  isPro: boolean;
}): PopcorniThemeId {
  const isProNow = input.authLoading ? false : input.isPro;
  return canUseTheme(input.storedId, isProNow) ? input.storedId : DEFAULT_THEME_ID;
}

function themeVars(theme: PopcorniTheme): CSSProperties {
  const chrome = CHROME[theme.appearance];
  return {
    [THEME_CSS_VARS.accent]: theme.colors.accent,
    [THEME_CSS_VARS.sheen]: theme.effects.sheen,
    [THEME_CSS_VARS.glow]: theme.effects.hoverGlow,
    [THEME_CSS_VARS.cardShadow]: chrome.cardShadow,
    [THEME_CSS_VARS.buttonShadow]: theme.effects.buttonShadow,
    [THEME_CSS_VARS.blur]: theme.effects.blur,
    [THEME_CSS_VARS.border]: chrome.cardBorder,
  } as CSSProperties;
}

export function getThemeSurfaces(theme: PopcorniTheme): ThemeSurfaces {
  const chrome = CHROME[theme.appearance];
  const vars = themeVars(theme);
  const page = {
    ...vars,
    backgroundColor: theme.colors.background,
    backgroundImage: theme.gradient.page,
    color: chrome.foreground,
  } as CSSProperties;
  const surface = {
    ...vars,
    backgroundColor: chrome.card,
    backgroundImage: "none",
    color: chrome.foreground,
  } as CSSProperties;

  return {
    page,
    card: surface,
    title: { color: chrome.foreground },
    muted: { color: chrome.muted },
    accent: { color: theme.colors.accent },
    button: {
      ...vars,
      backgroundImage: theme.gradient.button,
      color: theme.colors.buttonForeground,
      borderColor: "transparent",
    },
    buttonSecondary: {
      ...vars,
      backgroundColor: "transparent",
      color: theme.colors.accent,
      borderColor: chrome.cardBorder,
    },
    input: {
      ...vars,
      backgroundColor: chrome.input,
      color: chrome.foreground,
    },
    badge: {
      color: theme.colors.accent,
      borderColor: chrome.cardBorder,
      backgroundColor: "transparent",
    },
    proBadge: {
      color: theme.colors.buttonForeground,
      backgroundImage: theme.gradient.badge,
      borderColor: "transparent",
    },
    lock: { color: theme.colors.accent },
    overlay: { backgroundColor: chrome.scrim },
    modal: surface,
    logoPlate: {
      backgroundColor: theme.colors.logoPlate,
      color: theme.colors.accent,
      borderColor: chrome.cardBorder,
    },
    error: { color: chrome.danger },
  };
}
