"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PopcorniDashboard } from "@/components/dashboard/PopcorniDashboard";
import { AUTH_QUERY } from "@/config/constants";
import { rememberReturnTo } from "@/lib/auth/returnTo";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";

export function LoginEntry() {
  const searchParams = useSearchParams();
  const {
    user,
    isLoading,
    openLoginModal,
    closeLoginModal,
    continueToReturnTarget,
  } = usePopcorniAuth();
  const returnTo = searchParams.get(AUTH_QUERY.returnTo);

  useEffect(() => {
    if (returnTo) rememberReturnTo(returnTo);
  }, [returnTo]);

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      closeLoginModal();
      void continueToReturnTarget();
      return;
    }
    openLoginModal();
  }, [
    isLoading,
    user,
    openLoginModal,
    closeLoginModal,
    continueToReturnTarget,
  ]);

  return <PopcorniDashboard />;
}
