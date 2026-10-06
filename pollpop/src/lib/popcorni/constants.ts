import type { PopcorniThemeId } from "@/types/popcorniTheme";

/** Must stay aligned with popcorni-auth `AUTH`, `HANDOFF`, `THEME`, and `PROFILE_FIELDS`. */
export const PORTAL_ORIGIN_DEFAULT = "http://localhost:3003";

export const AUTH = {
  profileTable: "profiles",
  profileSchema: "public",
  cookieName: "popcorni-auth-token",
  cookiePath: "/",
  cookieSameSite: "lax",
  cookieEncoding: "base64url",
  returnToParam: "return_to",
  proStatusRecheckMs: 60_000,
  profileChannelPrefix: "popcorni-profile:",
} as const;

export const PROFILE_FIELDS = {
  id: "id",
  email: "email",
  isPro: "is_pro",
  proExpiresAt: "pro_expires_at",
  stripeConnectId: "stripe_connect_id",
} as const;

export const PROFILE_COLUMNS = [
  PROFILE_FIELDS.id,
  PROFILE_FIELDS.email,
  PROFILE_FIELDS.isPro,
  PROFILE_FIELDS.proExpiresAt,
  PROFILE_FIELDS.stripeConnectId,
].join(", ");

export const HANDOFF = {
  typeKey: "type",
  sessionType: "popcorni_session",
  accessTokenKey: "access_token",
  refreshTokenKey: "refresh_token",
} as const;

export const THEME = {
  storageKey: "popcorni-theme-id",
  changeEvent: "popcorni-theme-change",
  defaultId: "animal_race",
  queryKey: "pc_theme",
  premiumQueryKey: "premium",
} as const;

export const DEFAULT_THEME_ID: PopcorniThemeId = THEME.defaultId;

export const THEME_CSS_VARS = {
  accent: "--pc-accent",
  drift: "--pc-drift",
  sheen: "--pc-sheen",
  glow: "--pc-glow",
  cardShadow: "--pc-card-shadow",
  buttonShadow: "--pc-button-shadow",
  blur: "--pc-blur",
  border: "--pc-border",
} as const;

export function getPortalOrigin(): string {
  const value = process.env.NEXT_PUBLIC_POPCORNI_AUTH_URL?.trim();
  if (!value) return PORTAL_ORIGIN_DEFAULT;
  return value.replace(/\/$/, "");
}
