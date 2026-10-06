"use client";

import {
  AUTH_COPY,
  BILLING_COPY,
  PLANS,
  PRO_COPY,
  THEME,
  UI_CLASSES,
  lockedThemeMessage,
  proThemePitch,
} from "@/config/constants";
import { getThemeSurfaces } from "@/config/popcorniThemes";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Modal } from "@/components/ui/Modal";
import { buildStripeCheckoutUrl } from "@/lib/billing/checkoutUrl";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function UpgradeModal() {
  const { user } = usePopcorniAuth();
  const {
    themes,
    surfaces,
    upgradeModalOpen,
    upgradeTheme,
    closeUpgradeModal,
  } = usePopcorniTheme();
  const preview = upgradeTheme ? getThemeSurfaces(upgradeTheme) : surfaces;
  const proNames = themes
    .filter((theme) => theme.proOnly)
    .map((theme) => theme.name);
  const checkoutUrl = buildStripeCheckoutUrl(user);
  const title = upgradeTheme
    ? `${upgradeTheme.name} ${THEME.lockMark}`
    : PRO_COPY.unlockTitle;

  return (
    <Modal
      open={upgradeModalOpen}
      title={title}
      titleId="popcorni-upgrade-title"
      onClose={closeUpgradeModal}
      surfaces={preview}
    >
      <div className="flex flex-col gap-4">
        {upgradeTheme ? (
          <p className="text-sm font-semibold leading-6" style={preview.lock}>
            {lockedThemeMessage(upgradeTheme.name)}
          </p>
        ) : null}
        <p className="text-sm leading-6" style={preview.muted}>
          {proThemePitch(proNames)}
        </p>
        {upgradeTheme ? (
          <p className="text-sm leading-6" style={preview.muted}>
            {upgradeTheme.description}
          </p>
        ) : null}
        {user ? (
          checkoutUrl ? (
            <a
              className={UI_CLASSES.button}
              style={preview.button}
              href={checkoutUrl}
            >
              {PLANS.pro.upgradeLabel}
            </a>
          ) : (
            <p className="text-sm font-semibold" style={preview.error}>
              {BILLING_COPY.checkoutNotConfigured}
            </p>
          )
        ) : (
          <>
            <p className="text-sm leading-6" style={preview.muted}>
              {AUTH_COPY.continueAfterSignIn}
            </p>
            <GoogleSignInButton surfaces={preview} />
          </>
        )}
      </div>
    </Modal>
  );
}
