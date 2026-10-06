"use client";

import type { ReactNode } from "react";
import { PopcorniSessionProvider } from "@/components/popcorni/PopcorniSessionProvider";
import { PopcorniThemeProvider } from "@/components/popcorni/PopcorniThemeProvider";

export function PopcorniProviders({ children }: { children: ReactNode }) {
  return (
    <PopcorniSessionProvider>
      <PopcorniThemeProvider>{children}</PopcorniThemeProvider>
    </PopcorniSessionProvider>
  );
}
