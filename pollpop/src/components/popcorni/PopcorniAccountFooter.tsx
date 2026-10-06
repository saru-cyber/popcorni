"use client";

import { usePopcorniSession } from "@/components/popcorni/PopcorniSessionProvider";
import { getPortalHomeUrl } from "@/lib/popcorni/portal";

const GUEST_COPY = {
  title: "🚀 Explore Popcorni App Suite",
  body: "Discover more stream overlays, live widgets, and seamless tools for your stream.",
  action: "Explore All Apps & Sign in",
} as const;

const FREE_COPY = {
  title: "✨ Monetize & Elevate Your Live Stream",
  body: "Unlock Super Votes monetization, sequence presets, and exclusive Pro themes.",
  action: "Upgrade to Pro ($8/mo)",
} as const;

export function PopcorniAccountFooter({
  className = "mt-10",
}: {
  className?: string;
}) {
  const { user, isPro, isLoading } = usePopcorniSession();
  const portalUrl = getPortalHomeUrl();

  if (!isLoading && user && isPro) return null;

  const copy = user ? FREE_COPY : GUEST_COPY;

  return (
    <footer className={`${className} border-t border-current/20 pt-8`}>
      <section className="rounded-2xl border border-current/15 px-5 py-5 text-center sm:px-6">
        {isLoading ? (
          <p className="text-sm opacity-60">…</p>
        ) : (
          <>
            <h2 className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight">
              {copy.title}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 opacity-80">
              {copy.body}
            </p>
            <a
              href={portalUrl}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-current/30 px-4 py-2 text-sm font-semibold transition hover:bg-current/10"
            >
              {copy.action}
            </a>
          </>
        )}
      </section>
    </footer>
  );
}
