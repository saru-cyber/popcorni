"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AUTH_COPY, AUTH_QUERY, ROUTES, UI_CLASSES } from "@/config/constants";
import { completeOAuthCallback } from "@/lib/auth/callback";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const { surfaces } = usePopcorniTheme();
  const code = searchParams.get(AUTH_QUERY.code);
  const oauthError = searchParams.get(AUTH_QUERY.error);

  useEffect(() => {
    if (oauthError || !code) {
      window.location.replace(oauthError ? ROUTES.error : ROUTES.home);
      return;
    }
    void completeOAuthCallback(code)
      .then((target) => {
        window.location.replace(target);
      })
      .catch(() => {
        window.location.replace(ROUTES.error);
      });
  }, [code, oauthError]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <p
        className={`${UI_CLASSES.display} text-xl font-bold`}
        style={surfaces.title}
      >
        {AUTH_COPY.restoringSession}
      </p>
    </main>
  );
}
