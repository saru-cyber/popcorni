"use client";

import Link from "next/link";
import { APP, AUTH_COPY, ROUTES, UI_CLASSES } from "@/config/constants";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PopcorniLogo } from "@/components/auth/PopcorniLogo";
import { displayEmail } from "@/lib/auth/profile";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function SiteHeader() {
  const {
    user,
    profile,
    isLoading,
    authError,
    loginModalOpen,
    signOut,
    openLoginModal,
  } = usePopcorniAuth();
  const { surfaces } = usePopcorniTheme();
  const email = displayEmail(user, profile);

  return (
    <header className={`${UI_CLASSES.bar} flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between`} style={surfaces.card}>
      <Link href={ROUTES.home} className="group flex min-w-0 items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-105"
          style={surfaces.logoPlate}
        >
          <PopcorniLogo className="h-7 w-7" />
        </span>
        <span className="min-w-0">
          <h1
            className={`${UI_CLASSES.display} text-3xl font-extrabold tracking-tight sm:text-4xl`}
            style={surfaces.title}
          >
            {APP.name}
          </h1>
          <p
            className="mt-0.5 text-xs font-medium tracking-[0.22em]"
            style={surfaces.muted}
          >
            {APP.tagline}
          </p>
        </span>
      </Link>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-md sm:items-end">
        {isLoading ? (
          <p className="text-sm" style={surfaces.muted}>
            {AUTH_COPY.checkingAccount}
          </p>
        ) : user ? (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <p
              className="max-w-xs truncate text-sm font-medium"
              style={surfaces.title}
            >
              {email}
            </p>
            <button
              type="button"
              className={UI_CLASSES.buttonSecondary}
              style={surfaces.buttonSecondary}
              onClick={() => void signOut()}
            >
              {AUTH_COPY.signOut}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <GoogleSignInButton />
            <button
              type="button"
              className={UI_CLASSES.buttonSecondary}
              style={surfaces.buttonSecondary}
              onClick={openLoginModal}
            >
              {AUTH_COPY.openLoginModal}
            </button>
          </div>
        )}
        {authError && !loginModalOpen ? (
          <p className="max-w-xs text-right text-sm font-medium" style={surfaces.error}>
            {authError}
          </p>
        ) : null}
      </div>
    </header>
  );
}
