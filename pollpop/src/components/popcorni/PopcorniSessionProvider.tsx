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
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AUTH } from "@/lib/popcorni/constants";
import { evaluateIsPro, evaluatePollProFeatures, type PollProFeatures } from "@/lib/popcorni/evaluateProStatus";
import {
  loadProfile,
  subscribeToProfile,
  toPopcorniUser,
  type PopcorniUser,
  type Profile,
} from "@/lib/popcorni/profile";
import { redirectToPortalLogin } from "@/lib/popcorni/portal";
import { consumeSessionHandoff } from "@/lib/popcorni/sessionHandoff";
import { getPopcorniBrowserClient } from "@/lib/popcorni/supabaseBrowser";

export type PopcorniSessionContextValue = {
  user: PopcorniUser | null;
  profile: Profile | null;
  isPro: boolean;
  features: PollProFeatures;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
};

const PopcorniSessionContext = createContext<PopcorniSessionContextValue | null>(
  null,
);

export function PopcorniSessionProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<PopcorniUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(configured);
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
    const supabase = getPopcorniBrowserClient();
    if (!supabase) return;

    let alive = true;

    const syncProfile = (nextUser: User | null) => {
      profileUnsubRef.current();
      profileUnsubRef.current = () => {};
      if (!nextUser) {
        setProfile(null);
        return;
      }

      const requestId = profileRequestRef.current + 1;
      profileRequestRef.current = requestId;
      void loadProfile(supabase, nextUser.id).then((row) => {
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

    const applySession = (session: Session | null) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser ? toPopcorniUser(nextUser) : null);
      syncProfile(nextUser);
    };

    void (async () => {
      await consumeSessionHandoff(supabase);
      if (!alive) return;
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      applySession(data.session);
      setIsLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toPopcorniUser(session.user) : null);
        setIsLoading(false);
        window.setTimeout(() => {
          if (!alive) return;
          syncProfile(session?.user ?? null);
        }, 0);
      },
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
      profileUnsubRef.current();
    };
  }, []);

  const signIn = useCallback(() => {
    redirectToPortalLogin();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getPopcorniBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const isPro = evaluateIsPro(profile, nowMs);
  const features = useMemo(() => evaluatePollProFeatures(isPro), [isPro]);

  const value = useMemo<PopcorniSessionContextValue>(
    () => ({
      user,
      profile,
      isPro,
      features,
      isLoading,
      isConfigured: configured,
      signIn,
      signOut,
    }),
    [user, profile, isPro, features, isLoading, configured, signIn, signOut],
  );

  return (
    <PopcorniSessionContext.Provider value={value}>
      {children}
    </PopcorniSessionContext.Provider>
  );
}

export function usePopcorniSession(): PopcorniSessionContextValue {
  const value = useContext(PopcorniSessionContext);
  if (!value) {
    throw new Error(
      "usePopcorniSession must be used within PopcorniSessionProvider",
    );
  }
  return value;
}
