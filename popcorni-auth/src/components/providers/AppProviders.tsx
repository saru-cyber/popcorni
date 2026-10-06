"use client";

import type { ReactNode } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { PopcorniAuthProvider } from "@/components/providers/PopcorniAuthProvider";
import {
  PopcorniThemeProvider,
  usePopcorniTheme,
} from "@/components/providers/PopcorniThemeProvider";
import { ThemeParticles } from "@/components/theme/ThemeParticles";
import { PLANS } from "@/config/constants";
import { usePopcorniAuth } from "@/hooks/usePopcorniAuth";

function ThemedShell({ children }: { children: ReactNode }) {
  const { theme, surfaces } = usePopcorniTheme();
  const { isPro } = usePopcorniAuth();

  return (
    <div
      className="popcorni-shell relative min-h-screen overflow-x-hidden"
      style={surfaces.page}
      data-theme={theme.id}
      data-plan={isPro ? PLANS.pro.id : PLANS.free.id}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: theme.effects.atmosphere,
          backgroundSize: theme.effects.atmosphereSize,
        }}
        aria-hidden
      />
      <ThemeParticles theme={theme} />
      <div className="relative z-10">{children}</div>
      <UpgradeModal />
      <LoginModal />
    </div>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PopcorniAuthProvider>
      <PopcorniThemeProvider>
        <ThemedShell>{children}</ThemedShell>
      </PopcorniThemeProvider>
    </PopcorniAuthProvider>
  );
}
