"use client";

import {
  ACCOUNT_COPY,
  AUTH_COPY,
  PLANS,
  PRO_COPY,
  UI_CLASSES,
} from "@/config/constants";
import { proExpiryLine } from "@/lib/auth/formatProExpiry";
import { displayEmail } from "@/lib/auth/profile";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function AccountStatusCard() {
  const { user, profile, isPro, isLoading, openLoginModal } = usePopcorniAuth();
  const { surfaces, openUpgradeModal } = usePopcorniTheme();
  const email = displayEmail(user, profile);
  const expired = Boolean(profile?.is_pro) && !isPro && !isLoading;
  const expiry =
    isPro && profile?.pro_expires_at ? proExpiryLine(profile.pro_expires_at) : "";

  return (
    <section
      className={`${UI_CLASSES.card} flex h-full flex-col`}
      style={surfaces.card}
      aria-labelledby="account-status-title"
    >
      <p className={UI_CLASSES.eyebrow} style={surfaces.muted}>
        {ACCOUNT_COPY.eyebrow}
      </p>
      <h2
        id="account-status-title"
        className={`${UI_CLASSES.display} mt-4 truncate text-2xl font-semibold tracking-tight`}
        style={surfaces.title}
      >
        {email || ACCOUNT_COPY.signedOut}
      </h2>
      <div className="mt-5">
        {isLoading ? (
          <p className="text-sm leading-6" style={surfaces.muted}>
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
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-2 text-sm leading-6" style={surfaces.muted}>
        {expiry ? <p>{expiry}</p> : null}
        {isPro && profile && !profile.pro_expires_at ? (
          <p>{PRO_COPY.activeOpenEnded}</p>
        ) : null}
        {expired ? <p>{PRO_COPY.expired}</p> : null}
        {user ? (
          <p>
            {profile?.stripe_connect_id
              ? ACCOUNT_COPY.payoutsConnected
              : ACCOUNT_COPY.payoutsMissing}
          </p>
        ) : null}
        {user && !profile && !isLoading ? (
          <p>{ACCOUNT_COPY.profileUnavailable}</p>
        ) : null}
      </div>
      {!isLoading && !isPro ? (
        <button
          type="button"
          className={`${UI_CLASSES.button} mt-8 self-start`}
          style={surfaces.button}
          onClick={() => {
            if (!user) {
              openLoginModal();
              return;
            }
            openUpgradeModal();
          }}
        >
          {PLANS.pro.upgradeLabel}
        </button>
      ) : null}
    </section>
  );
}
