"use client";

import { ACCOUNT_INTRO_COPY, UI_CLASSES } from "@/config/constants";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function AccountPitch() {
  const { theme, surfaces } = usePopcorniTheme();

  return (
    <section className="px-1" aria-labelledby="account-pitch-title">
      <h2
        id="account-pitch-title"
        className={`${UI_CLASSES.display} text-2xl font-semibold tracking-tight sm:text-3xl`}
        style={surfaces.title}
      >
        {ACCOUNT_INTRO_COPY.title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 sm:text-base" style={surfaces.muted}>
        {ACCOUNT_INTRO_COPY.premise}
      </p>
      <ul className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-10">
        {ACCOUNT_INTRO_COPY.points.map((point) => (
          <li key={point.title}>
            <span
              className="mb-3 block h-px w-8"
              style={{ backgroundColor: theme.colors.accent }}
              aria-hidden
            />
            <h3
              className={`${UI_CLASSES.display} text-sm font-semibold tracking-tight`}
              style={surfaces.title}
            >
              {point.title}
            </h3>
            <p className="mt-1.5 text-sm leading-6" style={surfaces.muted}>
              {point.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
