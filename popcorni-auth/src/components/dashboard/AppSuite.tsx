"use client";

import { APP_SUITE, SUITE_COPY, UI_CLASSES } from "@/config/constants";
import { resolveSuiteAppUrl } from "@/lib/apps/resolveAppUrl";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function AppSuite() {
  const { surfaces } = usePopcorniTheme();

  return (
    <section className="flex flex-col gap-4" aria-labelledby="app-suite-title">
      <div className="px-1">
        <h2
          id="app-suite-title"
          className={`${UI_CLASSES.display} text-2xl font-semibold tracking-tight`}
          style={surfaces.title}
        >
          {SUITE_COPY.eyebrow}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-6" style={surfaces.muted}>
          {SUITE_COPY.intro}
        </p>
      </div>
      <div className="grid gap-5">
        {APP_SUITE.map((app) => (
          <article key={app.id} className={UI_CLASSES.card} style={surfaces.card}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl"
                  style={surfaces.logoPlate}
                  aria-hidden
                >
                  {app.icon}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3
                    className={`${UI_CLASSES.display} text-xl font-semibold tracking-tight`}
                    style={surfaces.title}
                  >
                    {app.name}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-6" style={surfaces.muted}>
                    {app.description}
                  </p>
                </div>
              </div>
              <a
                className={`${UI_CLASSES.button} shrink-0`}
                style={surfaces.button}
                href={resolveSuiteAppUrl(app)}
                target={app.openInNewTab ? "_blank" : undefined}
                rel={app.openInNewTab ? "noopener noreferrer" : undefined}
              >
                {app.launchLabel}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
