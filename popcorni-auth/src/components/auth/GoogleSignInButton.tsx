"use client";

import { AUTH_COPY, UI_CLASSES } from "@/config/constants";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";
import type { ThemeSurfaces } from "@/types/theme";

export function GoogleSignInButton({
  surfaces: surfacesOverride,
}: {
  surfaces?: ThemeSurfaces;
}) {
  const { signInWithGoogle, isSigningIn } = usePopcorniAuth();
  const { surfaces: activeSurfaces } = usePopcorniTheme();
  const surfaces = surfacesOverride ?? activeSurfaces;

  return (
    <button
      type="button"
      className={UI_CLASSES.button}
      style={surfaces.button}
      onClick={() => void signInWithGoogle()}
      disabled={isSigningIn}
    >
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-black"
        style={{ borderColor: "currentColor" }}
        aria-hidden
      >
        G
      </span>
      {isSigningIn ? AUTH_COPY.signingIn : AUTH_COPY.googleButtonLabel}
    </button>
  );
}
