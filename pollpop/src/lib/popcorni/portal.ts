import { AUTH, getPortalOrigin } from "@/lib/popcorni/constants";

export function getPortalHomeUrl(): string {
  return getPortalOrigin();
}

export function buildPortalLoginUrl(returnTo: string): string {
  const url = new URL("/login", getPortalOrigin());
  url.searchParams.set(AUTH.returnToParam, returnTo);
  return url.toString();
}

export function redirectToPortalLogin(): void {
  if (typeof window === "undefined") return;
  window.location.assign(buildPortalLoginUrl(window.location.href));
}
