"use client";

import { getPortalHomeUrl } from "@/lib/popcorni/portal";
import { usePopcorniSession } from "@/components/popcorni/PopcorniSessionProvider";
import { usePopcorniTheme } from "@/components/popcorni/PopcorniThemeProvider";

export function PopcorniAccountLinks({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { user, isPro, isLoading, signIn, signOut } = usePopcorniSession();
  const { surfaces, theme } = usePopcorniTheme();
  const portalUrl = getPortalHomeUrl();
  const label = compact ? "Popcorni" : "Popcorni Dashboard";

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
      <a
        href={portalUrl}
        className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight sm:text-xs"
        style={surfaces.buttonSecondary}
      >
        {label}
      </a>
      {isLoading ? (
        <span className="text-[11px] font-medium" style={surfaces.muted}>
          …
        </span>
      ) : user ? (
        <>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
            style={isPro ? surfaces.proBadge : surfaces.badge}
          >
            {isPro ? "PRO" : "FREE"}
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full px-2 py-1 text-[11px] font-semibold sm:text-xs"
            style={{ color: theme.colors.muted }}
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={signIn}
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs"
          style={surfaces.button}
        >
          Sign in
        </button>
      )}
    </div>
  );
}
