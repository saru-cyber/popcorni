"use client";

import { useState, type FormEvent } from "react";
import {
  ACCOUNT_COPY,
  AUTH_COPY,
  DISPLAY_NAME_MAX_LENGTH,
  PLANS,
  PRO_COPY,
  UI_CLASSES,
  loggedInAs,
  welcomeHeading,
} from "@/config/constants";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { proExpiryLine } from "@/lib/auth/formatProExpiry";
import { displayEmail, resolveDisplayName } from "@/lib/auth/profile";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden fill="none">
      <path
        d="M11.5 4.5 15.5 8.5M3.5 16.5l3.2-.6L16 6.6a1.4 1.4 0 0 0 0-2L15.4 4a1.4 1.4 0 0 0-2 0L4.1 13.3l-.6 3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountIntro() {
  const {
    user,
    profile,
    isPro,
    isLoading,
    authError,
    loginModalOpen,
    signOut,
    updateDisplayName,
  } = usePopcorniAuth();
  const { surfaces, openUpgradeModal } = usePopcorniTheme();
  const name = resolveDisplayName(user, profile);
  const email = displayEmail(user, profile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const expired = Boolean(profile?.is_pro) && !isPro && !isLoading;
  const expiry =
    isPro && profile?.pro_expires_at ? proExpiryLine(profile.pro_expires_at) : "";

  function startEdit() {
    setDraft(profile?.display_name.trim() || name);
    setNameError(null);
    setEditing(true);
  }

  async function saveName(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNameError(null);
    const error = await updateDisplayName(draft);
    setSaving(false);
    if (error) {
      setNameError(error);
      return;
    }
    setEditing(false);
  }

  return (
    <section
      className={UI_CLASSES.card}
      style={surfaces.card}
      aria-labelledby="account-intro-title"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className={UI_CLASSES.eyebrow} style={surfaces.muted}>
            {ACCOUNT_COPY.eyebrow}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <h2
              id="account-intro-title"
              className={`${UI_CLASSES.display} truncate text-2xl font-semibold tracking-tight`}
              style={surfaces.title}
            >
              {user ? welcomeHeading(name) : ACCOUNT_COPY.guest}
            </h2>
            {user && !editing ? (
              <button
                type="button"
                className="popcorni-focus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                style={surfaces.buttonSecondary}
                aria-label={ACCOUNT_COPY.editName}
                onClick={startEdit}
              >
                <PencilIcon />
              </button>
            ) : null}
          </div>
          {editing ? (
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={(event) => void saveName(event)}
            >
              <label className="sr-only" htmlFor="display-name">
                {ACCOUNT_COPY.namePlaceholder}
              </label>
              <input
                id="display-name"
                value={draft}
                maxLength={DISPLAY_NAME_MAX_LENGTH}
                autoFocus
                placeholder={ACCOUNT_COPY.namePlaceholder}
                className={`${UI_CLASSES.input} sm:max-w-xs`}
                style={surfaces.input}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={UI_CLASSES.button}
                  style={surfaces.button}
                  disabled={saving}
                >
                  {saving ? "Saving…" : ACCOUNT_COPY.saveName}
                </button>
                <button
                  type="button"
                  className={UI_CLASSES.buttonSecondary}
                  style={surfaces.buttonSecondary}
                  onClick={() => setEditing(false)}
                >
                  {ACCOUNT_COPY.cancelName}
                </button>
              </div>
            </form>
          ) : null}
          {nameError ? (
            <p className="mt-2 text-sm font-medium" style={surfaces.error}>
              {nameError}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-6" style={surfaces.muted}>
            {user ? email || ACCOUNT_COPY.profileUnavailable : ACCOUNT_COPY.signedOut}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          {isLoading ? (
            <p className="text-sm" style={surfaces.muted}>
              {AUTH_COPY.checkingAccount}
            </p>
          ) : (
            <span
              className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
              style={isPro ? surfaces.proBadge : surfaces.badge}
              data-plan={isPro ? PLANS.pro.id : PLANS.free.id}
            >
              {isPro ? PLANS.pro.label : PLANS.free.label}
            </span>
          )}
          {user ? (
            <p className="text-sm font-medium" style={surfaces.title}>
              {loggedInAs(name)}
            </p>
          ) : null}
          {expiry ? (
            <p className="text-sm" style={surfaces.muted}>
              {expiry}
            </p>
          ) : null}
          {isPro && profile && !profile.pro_expires_at ? (
            <p className="text-sm" style={surfaces.muted}>
              {PRO_COPY.activeOpenEnded}
            </p>
          ) : null}
          {expired ? (
            <p className="text-sm" style={surfaces.muted}>
              {PRO_COPY.expired}
            </p>
          ) : null}
          {user ? (
            <p className="text-sm" style={surfaces.muted}>
              {profile?.stripe_connect_id
                ? ACCOUNT_COPY.payoutsConnected
                : ACCOUNT_COPY.payoutsMissing}
            </p>
          ) : null}
          {!isLoading && !user ? (
            <GoogleSignInButton label={AUTH_COPY.signInUp} />
          ) : null}
          {!isLoading && user ? (
            <button
              type="button"
              className={UI_CLASSES.buttonSecondary}
              style={surfaces.buttonSecondary}
              onClick={() => void signOut()}
            >
              {AUTH_COPY.signOut}
            </button>
          ) : null}
          {!isLoading && user && !isPro ? (
            <button
              type="button"
              className={UI_CLASSES.button}
              style={surfaces.button}
              onClick={() => openUpgradeModal()}
            >
              {PLANS.pro.upgradeLabel}
            </button>
          ) : null}
          {authError && !loginModalOpen ? (
            <p className="max-w-xs text-sm font-medium sm:text-right" style={surfaces.error}>
              {authError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
