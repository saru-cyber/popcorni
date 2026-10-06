"use client";

import Link from "next/link";
import { APP, ROUTES, UI_CLASSES } from "@/config/constants";
import { PopcorniLogo } from "@/components/auth/PopcorniLogo";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";

export function SiteHeader() {
  const { surfaces } = usePopcorniTheme();

  return (
    <header
      className={`${UI_CLASSES.bar} flex items-center`}
      style={surfaces.card}
    >
      <Link href={ROUTES.home} className="group flex min-w-0 items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-105"
          style={surfaces.logoPlate}
        >
          <PopcorniLogo className="h-7 w-7" />
        </span>
        <span className="min-w-0">
          <h1
            className={`${UI_CLASSES.display} text-3xl font-extrabold tracking-tight sm:text-4xl`}
            style={surfaces.title}
          >
            {APP.name}
          </h1>
          <p
            className="mt-0.5 text-xs font-medium tracking-[0.22em]"
            style={surfaces.muted}
          >
            {APP.tagline}
          </p>
        </span>
      </Link>
    </header>
  );
}
