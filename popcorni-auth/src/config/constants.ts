import type { SuiteApp } from "@/types/apps";
import type { PopcorniThemeId } from "@/types/theme";

/**
 * Source of truth for product copy, plan names, routes, and env key names.
 * Client env values must still be read with static `process.env.NEXT_PUBLIC_*`
 * access so Next.js can inline them. Keep `ENV` aligned with those reads.
 */

export const DEV_SERVER_PORT = 3003;
export const DEFAULT_SITE_URL = `http://localhost:${DEV_SERVER_PORT}`;
/** Used only when NEXT_PUBLIC_POLLPOP_URL is unset. */
export const DEFAULT_POLLPOP_PORT = 3000;
export const DEFAULT_POLLPOP_URL = `http://localhost:${DEFAULT_POLLPOP_PORT}`;

export const ENV = {
  supabaseUrl: "NEXT_PUBLIC_SUPABASE_URL",
  supabaseAnonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  siteUrl: "NEXT_PUBLIC_SITE_URL",
  cookieDomain: "NEXT_PUBLIC_AUTH_COOKIE_DOMAIN",
  returnOrigins: "NEXT_PUBLIC_AUTH_RETURN_ORIGINS",
  stripeCheckoutUrl: "NEXT_PUBLIC_STRIPE_PRO_CHECKOUT_URL",
  pollpopUrl: "NEXT_PUBLIC_POLLPOP_URL",
} as const;

export const APP = {
  name: "Popcorni",
  tagline: "Live, Pop, Hype",
  description:
    "Popcorni account portal for shared sign-in, Pro status, and live themes.",
} as const;

export const FONT_SETUP = {
  displayVariable: "--font-display",
  bodyVariable: "--font-body",
  displayWeights: ["600", "700", "800", "900"],
  bodyWeights: ["400", "500", "600", "700"],
} as const;

export const LOCALE = "en" as const;

export const PLANS = {
  free: {
    id: "free",
    label: "FREE Plan",
  },
  pro: {
    id: "pro",
    label: "PRO Plan 👑",
    upgradeLabel: "Upgrade to Pro",
  },
} as const;

export const PAGE_COPY = {
  homeTitle: APP.name,
  homeDescription: APP.description,
  loginTitle: `Sign in — ${APP.name}`,
  callbackTitle: `Signing in — ${APP.name}`,
  errorTitle: `Sign-in error — ${APP.name}`,
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  callback: "/auth/callback",
  error: "/auth/error",
} as const;

export const AUTH_QUERY = {
  code: "code",
  error: "error",
  returnTo: "return_to",
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

export const PROFILE_DEFAULTS = {
  isPro: false,
  proExpiresAt: null,
  stripeConnectId: null,
} as const;

export const AUTH = {
  profileTable: "profiles",
  profileSchema: "public",
  oauthProvider: "google",
  oauthPrompt: "select_account",
  oauthAccessType: "offline",
  cookieName: "popcorni-auth-token",
  cookiePath: "/",
  cookieSameSite: "lax",
  cookieEncoding: "base64url",
  cookieMirrorKey: "popcorni-auth-cookie-mirror",
  returnToCookie: "popcorni-auth-return",
  returnToStorageKey: "popcorni-auth-return",
  returnToMaxAgeSeconds: 600,
  broadcastChannel: "popcorni-auth",
  broadcastEvent: "session-changed",
  storageSyncDebounceMs: 150,
  profileChannelPrefix: "popcorni-profile:",
  proStatusRecheckMs: 60_000,
} as const;

export const THEME = {
  storageKey: "popcorni-theme-id",
  changeEvent: "popcorni-theme-change",
  defaultId: "animal_race",
  lockMark: "🔒",
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

export const HANDOFF = {
  typeKey: "type",
  sessionType: "popcorni_session",
  accessTokenKey: "access_token",
  refreshTokenKey: "refresh_token",
  expiresInKey: "expires_in",
  tokenTypeKey: "token_type",
  bearer: "bearer",
} as const;

export const STRIPE = {
  clientReferenceParam: "client_reference_id",
  emailParam: "prefilled_email",
} as const;

export const EMBEDDED_BROWSER_UA_PATTERNS = ["obs"] as const;

export const APP_IDS = {
  pollpop: "pollpop",
} as const;

const POLLPOP_NAME = "PollPop";

export const APP_SUITE: readonly SuiteApp[] = [
  {
    id: APP_IDS.pollpop,
    name: POLLPOP_NAME,
    description: `Live stream polls with realtime results, OBS overlays, and venue projection — signed in with your ${APP.name} account.`,
    launchLabel: `Launch ${POLLPOP_NAME}`,
    icon: "🗳️",
    defaultUrl: DEFAULT_POLLPOP_URL,
    openInNewTab: true,
  },
];

export const AUTH_COPY = {
  googleButtonLabel: `Continue with Google (${APP.name} Account)`,
  signingIn: "Continuing to Google…",
  signOut: "Sign out",
  openLoginModal: `${APP.name} Account`,
  loginTitle: `${APP.name} Account`,
  close: "Close",
  dismiss: "Dismiss dialog",
  sessionRestoreNote:
    "Sign in inside this window. The session is restored as soon as Google sends you back — in the OBS browser, on another device after you sign in there, and when another Popcorni app returns you here.",
  embeddedBrowserNote:
    "This window looks like an embedded live browser. Stay here; Google will return to this page and restore the session.",
  notConfigured: `Supabase is not configured yet. Add ${ENV.supabaseUrl} and ${ENV.supabaseAnonKey}.`,
  signInFailed: "Google sign-in could not start. Try again in this window.",
  checkingAccount: `Checking your ${APP.name} account…`,
  restoringSession: "Restoring your session…",
  errorTitle: "Sign-in didn't finish",
  errorBody:
    "Google sent us back before a session could be restored. Try again in this same browser.",
  tryAgain: "Try again",
  backHome: "Back to portal",
  continueAfterSignIn: `Sign in with your ${APP.name} account to continue to Pro checkout.`,
} as const;

export const ACCOUNT_COPY = {
  eyebrow: "Account",
  signedOut: "You are not signed in",
  payoutsConnected: "Stripe Connect linked",
  payoutsMissing: "Stripe Connect not linked",
  profileUnavailable: "Profile details will appear after the account row is available.",
} as const;

export const PRO_COPY = {
  expiresPrefix: "Pro access through",
  activeOpenEnded: "Pro access is active",
  expired: "Pro access has expired",
  unlockTitle: "Unlock Pro themes",
} as const;

export const THEME_COPY = {
  eyebrow: "Theme",
  label: `${APP.name} theme`,
  liveHint: "Switching a theme restyles this portal immediately.",
  freeGroup: "Free",
  proGroup: "Pro",
} as const;

export const SUITE_COPY = {
  eyebrow: "App Suite",
  intro: `Apps that share your ${APP.name} account.`,
} as const;

export const BILLING_COPY = {
  checkoutNotConfigured: `Pro checkout is not configured yet. Add ${ENV.stripeCheckoutUrl}.`,
} as const;

export const UI_CLASSES = {
  display: "popcorni-display",
  button:
    "popcorni-button popcorni-focus inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-60",
  buttonSecondary:
    "popcorni-button-secondary popcorni-focus inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-tight",
  card: "popcorni-card rounded-2xl p-6 sm:p-7",
  bar: "popcorni-bar rounded-2xl px-5 py-4 sm:px-6 sm:py-5",
  chip: "popcorni-chip popcorni-focus",
  input:
    "popcorni-input popcorni-focus w-full rounded-xl border px-4 py-3 text-sm font-medium",
  select:
    "popcorni-select popcorni-focus w-full rounded-xl border px-3.5 py-3 text-sm font-semibold",
  menu: "popcorni-menu",
  menuItem: "popcorni-menu-item popcorni-focus",
  eyebrow: "text-[11px] font-semibold tracking-[0.22em] uppercase",
  modal:
    "popcorni-modal relative z-10 w-full max-w-lg rounded-[1.75rem] p-6 outline-none sm:p-7",
} as const;

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getConfiguredSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return DEFAULT_SITE_URL;
  return value.replace(/\/$/, "");
}

export function getBrowserSiteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getConfiguredSiteUrl();
}

export function getAuthCookieDomain(): string | undefined {
  const value = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim() ?? "";
  return value || undefined;
}

export function getAllowedReturnOrigins(): readonly string[] {
  const raw = process.env.NEXT_PUBLIC_AUTH_RETURN_ORIGINS?.trim() ?? "";
  if (!raw) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function getStripeProCheckoutUrl(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PRO_CHECKOUT_URL?.trim() ?? "";
}

/** Raw `NEXT_PUBLIC_POLLPOP_URL`. Empty when the env var is unset. */
export function getPollpopUrlOverride(): string {
  return process.env.NEXT_PUBLIC_POLLPOP_URL?.trim() ?? "";
}

/** Env URL first, then the local dev default. */
export function getPollpopUrl(): string {
  return getPollpopUrlOverride() || DEFAULT_POLLPOP_URL;
}

export function lockedThemeMessage(themeName: string): string {
  return `${themeName} is locked on the ${PLANS.free.label}. Upgrade to wear it on this portal.`;
}

export function joinThemeNames(names: readonly string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function proThemePitch(names: readonly string[]): string {
  const list = joinThemeNames(names);
  if (!list) return `${PLANS.pro.label} unlocks the full ${APP.name} theme set.`;
  return `${PLANS.pro.label} unlocks ${list} across ${APP.name}.`;
}
