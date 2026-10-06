import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH,
  AUTH_QUERY,
  ROUTES,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/config/constants";
import { isOAuthExchangeSuccess } from "@/lib/auth/callback";
import { resolvePostLoginLocation } from "@/lib/auth/returnTo";
import { getSharedSupabaseOptions } from "@/lib/supabase/options";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function redirectTarget(request: NextRequest, target: string): URL {
  try {
    if (target.startsWith("/")) return new URL(target, request.nextUrl.origin);
    return new URL(target);
  } catch {
    return new URL(ROUTES.home, request.nextUrl.origin);
  }
}

function redirectTo(
  request: NextRequest,
  target: string,
  cookies: PendingCookie[] = [],
  headers: Record<string, string> = {},
): NextResponse {
  const response = NextResponse.redirect(redirectTarget(request, target));
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

function rememberedReturnTo(request: NextRequest): string | null {
  const fromQuery = request.nextUrl.searchParams.get(AUTH_QUERY.returnTo)?.trim();
  if (fromQuery) return fromQuery;
  const fromCookie = request.cookies.get(AUTH.returnToCookie)?.value.trim();
  return fromCookie || null;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get(AUTH_QUERY.code)?.trim() ?? "";
  const oauthError = request.nextUrl.searchParams.get(AUTH_QUERY.error);

  if (!code || !isSupabaseConfigured()) {
    const target = !code && !oauthError ? ROUTES.home : ROUTES.error;
    return redirectTo(request, target);
  }

  const pending: PendingCookie[] = [];
  const headers: Record<string, string> = {};
  const shared = getSharedSupabaseOptions(request.nextUrl.protocol);
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieEncoding: shared.cookieEncoding,
    cookieOptions: shared.cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headerBag) {
        pending.push(...cookiesToSet);
        Object.assign(headers, headerBag);
      },
    },
  });

  let exchangeError: unknown = null;
  let session: Session | null = null;
  try {
    const exchanged = await supabase.auth.exchangeCodeForSession(code);
    exchangeError = exchanged.error;
    session = exchanged.data.session ?? null;
    if (!session) {
      const current = await supabase.auth.getSession();
      session = current.data.session ?? null;
    }
  } catch (error) {
    exchangeError = error;
  }

  if (!isOAuthExchangeSuccess(exchangeError, session)) {
    return redirectTo(request, ROUTES.error);
  }

  const target = resolvePostLoginLocation(rememberedReturnTo(request), session);
  pending.push({
    name: AUTH.returnToCookie,
    value: "",
    options: { path: AUTH.cookiePath, maxAge: 0, sameSite: "lax" },
  });
  return redirectTo(request, target, pending, headers);
}
