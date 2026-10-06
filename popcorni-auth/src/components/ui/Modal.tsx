"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AUTH_COPY, UI_CLASSES } from "@/config/constants";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";
import type { ThemeSurfaces } from "@/types/theme";

export function Modal({
  open,
  title,
  titleId,
  onClose,
  surfaces: surfacesOverride,
  children,
}: {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  surfaces?: ThemeSurfaces;
  children: ReactNode;
}) {
  const { surfaces: themeSurfaces } = usePopcorniTheme();
  const surfaces = surfacesOverride ?? themeSurfaces;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="popcorni-scrim absolute inset-0"
        style={surfaces.overlay}
        aria-label={AUTH_COPY.dismiss}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={UI_CLASSES.modal}
        style={surfaces.modal}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className={`${UI_CLASSES.display} text-2xl font-black`} style={surfaces.title}>
            {title}
          </h2>
          <button
            type="button"
            className={UI_CLASSES.buttonSecondary}
            style={surfaces.buttonSecondary}
            onClick={onClose}
          >
            {AUTH_COPY.close}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
