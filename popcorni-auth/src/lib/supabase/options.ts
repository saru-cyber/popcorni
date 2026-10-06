import {
  AUTH,
  getAuthCookieDomain,
  getConfiguredSiteUrl,
} from "@/config/constants";

export function isSecureCookieContext(protocol?: string): boolean {
  if (protocol) return protocol === "https:";
  if (typeof window !== "undefined") {
    return window.location.protocol === "https:";
  }
  return getConfiguredSiteUrl().startsWith("https://");
}

export function getSharedSupabaseOptions(protocol?: string) {
  const domain = getAuthCookieDomain();
  return {
    cookieEncoding: AUTH.cookieEncoding,
    cookieOptions: {
      name: AUTH.cookieName,
      path: AUTH.cookiePath,
      sameSite: AUTH.cookieSameSite,
      secure: isSecureCookieContext(protocol),
      ...(domain ? { domain } : {}),
    },
  } as const;
}
