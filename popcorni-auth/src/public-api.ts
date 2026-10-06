export {
  APP,
  APP_SUITE,
  DEFAULT_THEME_ID,
  PLANS,
} from "@/config/constants";
export {
  canUseTheme,
  getThemeSurfaces,
  isPopcorniThemeId,
  listPopcorniThemes,
  POPCORNI_THEMES,
  resolveActiveThemeId,
} from "@/config/popcorniThemes";
export { evaluateIsPro } from "@/lib/auth/evaluateProStatus";
export { parseProfile } from "@/lib/auth/parseProfile";
export {
  appendSessionHandoff,
  consumeSessionHandoff,
} from "@/lib/auth/sessionHandoff";
export type { PopcorniUser, Profile, ProfileInsert } from "@/types/auth";
export type {
  PopcorniTheme,
  PopcorniThemeId,
  ThemeAppearance,
  ThemeColors,
  ThemeGradients,
  ThemeTier,
  ThemeVfxParticles,
} from "@/types/theme";
export { POPCORNI_THEME_IDS } from "@/types/theme";
