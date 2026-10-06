"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { AUTH, AUTH_COPY, isSupabaseConfigured } from "@/config/constants";
import { continueToReturnTarget } from "@/lib/auth/callback";
import { evaluateIsPro } from "@/lib/auth/evaluateProStatus";
import {
  loadOrCreateProfile,
  subscribeToProfile,
  toPopcorniUser,
} from "@/lib/auth/profile";
import { buildOAuthRedirectUrl } from "@/lib/auth/returnTo";
import {
  publishSessionChanged,
  subscribeSessionChanged,
} from "@/lib/auth/sessionChannel";
import { consumeSessionHandoff } from "@/lib/auth/sessionHandoff";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PopcorniUser, Profile } from "@/types/auth";

export type PopcorniAuthContextValue = {
  user: PopcorniUser | null;
  profile: Profile | null;
  isPro: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  isSigningIn: boolean;
  authError: string | null;
  loginModalOpen: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearAuthError: () => void;
  continueToReturnTarget: () => Promise<void>;
};

const PopcorniAuthContext = createContext<PopcorniAuthContextValue | null>(
  null,
);

export function PopcorniAuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<PopcorniUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(configured);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const profileUnsubRef = useRef<() => void>(() => {});
  const profileRequestRef = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, AUTH.proStatusRecheckMs);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let alive = true;

    const applySession = (session: Session | null) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser ? toPopcorniUser(nextUser) : null);
      syncProfile(nextUser);
    };

    const syncProfile = (nextUser: User | null) => {
      profileUnsubRef.current();
      profileUnsubRef.current = () => {};
      if (!nextUser) {
        setProfile(null);
        return;
      }

      const requestId = profileRequestRef.current + 1;
      profileRequestRef.current = requestId;
      void loadOrCreateProfile(supabase, nextUser).then((row) => {
        if (!alive || profileRequestRef.current !== requestId) return;
        setProfile(row);
      });
      profileUnsubRef.current = subscribeToProfile(
        supabase,
        nextUser.id,
        (row) => {
          if (alive) setProfile(row);
        },
      );
    };

    const refreshFromStorage = () => {
      void supabase.auth.getSession().then(({ data }) => {
        if (!alive) return;
        applySession(data.session);
        setIsLoading(false);
      });
    };

    void (async () => {
      const handedOff = await consumeSessionHandoff(supabase);
      if (!alive) return;
      if (handedOff) publishSessionChanged();
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      applySession(data.session);
      setIsLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ? toPopcorniUser(session.user) : null);
        setIsLoading(false);
        setIsSigningIn(false);
        if (event === "SIGNED_IN") {
          setAuthError(null);
          setLoginModalOpen(false);
        }
        window.setTimeout(() => {
          if (!alive) return;
          syncProfile(session?.user ?? null);
        }, 0);
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          publishSessionChanged();
        }
      },
    );

    const stopChannel = subscribeSessionChanged(refreshFromStorage);
    let debounceTimer = 0;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH.cookieMirrorKey) return;
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(
        refreshFromStorage,
        AUTH.storageSyncDebounceMs,
      );
    };
    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      window.clearTimeout(debounceTimer);
      listener.subscription.unsubscribe();
      profileUnsubRef.current();
      stopChannel();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthError(AUTH_COPY.notConfigured);
      setLoginModalOpen(true);
      return;
    }

    setAuthError(null);
    setIsSigningIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: AUTH.oauthProvider,
      options: {
        redirectTo: buildOAuthRedirectUrl(),
        skipBrowserRedirect: false,
        queryParams: {
          prompt: AUTH.oauthPrompt,
          access_type: AUTH.oauthAccessType,
        },
      },
    });

    if (error) {
      setIsSigningIn(false);
      setAuthError(AUTH_COPY.signInFailed);
      setLoginModalOpen(true);
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);
  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo<PopcorniAuthContextValue>(
    () => ({
      user,
      profile,
      isPro: evaluateIsPro(profile, nowMs),
      isLoading,
      isConfigured: configured,
      isSigningIn,
      authError,
      loginModalOpen,
      signInWithGoogle,
      signOut,
      openLoginModal,
      closeLoginModal,
      clearAuthError,
      continueToReturnTarget,
    }),
    [
      user,
      profile,
      nowMs,
      isLoading,
      configured,
      isSigningIn,
      authError,
      loginModalOpen,
      signInWithGoogle,
      signOut,
      openLoginModal,
      closeLoginModal,
      clearAuthError,
    ],
  );

  return (
    <PopcorniAuthContext.Provider value={value}>
      {children}
    </PopcorniAuthContext.Provider>
  );
}

export function usePopcorniAuth(): PopcorniAuthContextValue {
  const value = useContext(PopcorniAuthContext);
  if (!value) {
    throw new Error(
      "usePopcorniAuth must be used within PopcorniAuthProvider",
    );
  }
  return value;
}
