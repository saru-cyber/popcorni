"use client";

import { useSyncExternalStore } from "react";
import { AUTH_COPY } from "@/config/constants";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Modal } from "@/components/ui/Modal";
import { isEmbeddedBrowser } from "@/lib/auth/embeddedBrowser";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

function subscribeEmbeddedBrowser() {
  return () => {};
}

function readEmbeddedBrowser() {
  return isEmbeddedBrowser(window.navigator.userAgent);
}

function readEmbeddedBrowserOnServer() {
  return false;
}

export function LoginModal() {
  const { loginModalOpen, closeLoginModal, authError } = usePopcorniAuth();
  const { surfaces } = usePopcorniTheme();
  const embedded = useSyncExternalStore(
    subscribeEmbeddedBrowser,
    readEmbeddedBrowser,
    readEmbeddedBrowserOnServer,
  );

  return (
    <Modal
      open={loginModalOpen}
      title={AUTH_COPY.loginTitle}
      titleId="popcorni-login-title"
      onClose={closeLoginModal}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6" style={surfaces.muted}>
          {AUTH_COPY.sessionRestoreNote}
        </p>
        {embedded ? (
          <p className="text-sm leading-6" style={surfaces.accent}>
            {AUTH_COPY.embeddedBrowserNote}
          </p>
        ) : null}
        {authError ? (
          <p className="text-sm font-semibold" style={surfaces.error}>
            {authError}
          </p>
        ) : null}
        <GoogleSignInButton />
      </div>
    </Modal>
  );
}
