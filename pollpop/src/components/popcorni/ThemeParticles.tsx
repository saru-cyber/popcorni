"use client";

import type { CSSProperties } from "react";
import { THEME_CSS_VARS } from "@/lib/popcorni/constants";
import type { PopcorniTheme } from "@/types/popcorniTheme";

export function ThemeParticles({ theme }: { theme: PopcorniTheme }) {
  if (!theme.vfx.enabled || theme.vfx.count <= 0 || theme.vfx.symbols.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: theme.vfx.count }, (_, index) => {
        const symbol = theme.vfx.symbols[index % theme.vfx.symbols.length] ?? "";
        const left = (index * 17 + 9) % 100;
        const delay = ((index * 13) % 20) / 10;
        const drift = ((index % 5) - 2) * theme.vfx.driftPx;
        const style = {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${theme.vfx.speedMs}ms`,
          fontSize: `${theme.vfx.sizeRem}rem`,
          color: theme.vfx.color,
          [THEME_CSS_VARS.drift]: `${drift}px`,
        } as CSSProperties;
        return (
          <span
            key={`${theme.id}-${index}`}
            className="popcorni-particle"
            style={style}
          >
            {symbol}
          </span>
        );
      })}
    </div>
  );
}
