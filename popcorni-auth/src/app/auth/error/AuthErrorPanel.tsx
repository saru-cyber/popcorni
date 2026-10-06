"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/dashboard/SiteHeader";
import { AUTH_COPY, ROUTES, UI_CLASSES } from "@/config/constants";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function AuthErrorPanel() {
  const { openLoginModal } = usePopcorniAuth();
  const { surfaces } = usePopcorniTheme();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <SiteHeader />
      <section className={UI_CLASSES.card} style={surfaces.card}>
        <h2
          className={`${UI_CLASSES.display} text-3xl font-black`}
          style={surfaces.title}
        >
          {AUTH_COPY.errorTitle}
        </h2>
        <p className="mt-3 text-sm leading-6" style={surfaces.muted}>
          {AUTH_COPY.errorBody}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={UI_CLASSES.button}
            style={surfaces.button}
            onClick={openLoginModal}
          >
            {AUTH_COPY.tryAgain}
          </button>
          <Link
            href={ROUTES.home}
            className={UI_CLASSES.buttonSecondary}
            style={surfaces.buttonSecondary}
          >
            {AUTH_COPY.backHome}
          </Link>
        </div>
      </section>
    </main>
  );
}
