"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { THEME, THEME_COPY, UI_CLASSES } from "@/config/constants";
import { usePopcorniTheme } from "@/hooks/usePopcorniTheme";
import type { PopcorniTheme } from "@/types/theme";

function optionLabel(option: PopcorniTheme, locked: boolean): string {
  return locked ? `${option.name} ${THEME.lockMark}` : option.name;
}

export function ThemeSelect() {
  const { theme, themes, surfaces, setThemeId, isThemeUnlocked } =
    usePopcorniTheme();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const freeThemes = themes.filter((option) => !option.proOnly);
  const proThemes = themes.filter((option) => option.proOnly);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function openMenu() {
    const index = themes.findIndex((option) => option.id === theme.id);
    setActiveIndex(index < 0 ? 0 : index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = themes[index];
    if (!option) return;
    setThemeId(option.id);
    setOpen(false);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % themes.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + themes.length) % themes.length);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(activeIndex);
    }
  }

  const activeTheme = themes[activeIndex];

  return (
    <section
      className={`${UI_CLASSES.card} relative flex h-full flex-col ${open ? "z-30" : ""}`}
      style={surfaces.card}
      aria-labelledby="theme-select-title"
    >
      <p className={UI_CLASSES.eyebrow} style={surfaces.muted}>
        {THEME_COPY.eyebrow}
      </p>
      <h2
        id="theme-select-title"
        className={`${UI_CLASSES.display} mt-4 text-2xl font-semibold tracking-tight`}
        style={surfaces.title}
      >
        {theme.name}
      </h2>
      <p className="mt-2 text-sm leading-6" style={surfaces.muted}>
        {THEME_COPY.liveHint}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {themes.map((option) => {
          const locked = option.proOnly && !isThemeUnlocked(option.id);
          const selected = option.id === theme.id;
          return (
            <button
              key={option.id}
              type="button"
              className={UI_CLASSES.chip}
              style={{
                backgroundImage: option.gradient.button,
                color: option.colors.buttonForeground,
                boxShadow: selected ? option.effects.hoverGlow : undefined,
              }}
              aria-pressed={selected}
              onClick={() => setThemeId(option.id)}
            >
              {optionLabel(option, locked)}
            </button>
          );
        })}
      </div>
      <label
        className="mt-6 block text-sm font-medium"
        style={surfaces.title}
        htmlFor="popcorni-theme"
      >
        {THEME_COPY.label}
      </label>
      <div className="relative mt-2" ref={rootRef}>
        <button
          id="popcorni-theme"
          type="button"
          className={UI_CLASSES.select}
          style={surfaces.input}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeTheme ? `${listId}-${activeTheme.id}` : undefined}
          aria-describedby="popcorni-theme-description"
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className="popcorni-swatch"
              style={{ backgroundImage: theme.gradient.button }}
              aria-hidden
            />
            <span className="truncate">
              {optionLabel(theme, theme.proOnly && !isThemeUnlocked(theme.id))}
            </span>
          </span>
          <Chevron open={open} />
        </button>
        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label={THEME_COPY.label}
            className={UI_CLASSES.menu}
            style={surfaces.card}
          >
            <MenuGroup
              label={THEME_COPY.freeGroup}
              options={freeThemes}
              themes={themes}
              activeIndex={activeIndex}
              listId={listId}
              currentId={theme.id}
              isThemeUnlocked={isThemeUnlocked}
              muted={surfaces.muted}
              onHover={setActiveIndex}
              onChoose={choose}
            />
            <MenuGroup
              label={THEME_COPY.proGroup}
              options={proThemes}
              themes={themes}
              activeIndex={activeIndex}
              listId={listId}
              currentId={theme.id}
              isThemeUnlocked={isThemeUnlocked}
              muted={surfaces.muted}
              onHover={setActiveIndex}
              onChoose={choose}
            />
          </div>
        ) : null}
      </div>
      <p
        id="popcorni-theme-description"
        className="mt-4 text-sm leading-6"
        style={surfaces.muted}
        aria-live="polite"
      >
        {theme.description}
      </p>
      <div className="mt-auto pt-6" aria-hidden>
        <div
          className="h-1.5 w-full rounded-full"
          style={{
            backgroundImage: theme.gradient.button,
            boxShadow: theme.effects.hoverGlow,
          }}
        />
      </div>
    </section>
  );
}

function MenuGroup({
  label,
  options,
  themes,
  activeIndex,
  listId,
  currentId,
  isThemeUnlocked,
  muted,
  onHover,
  onChoose,
}: {
  label: string;
  options: readonly PopcorniTheme[];
  themes: readonly PopcorniTheme[];
  activeIndex: number;
  listId: string;
  currentId: string;
  isThemeUnlocked: (themeId: PopcorniTheme["id"]) => boolean;
  muted: CSSProperties;
  onHover: (index: number) => void;
  onChoose: (index: number) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="py-1">
      <p className="popcorni-menu-label" style={muted}>
        {label}
      </p>
      {options.map((option) => {
        const index = themes.findIndex((item) => item.id === option.id);
        const locked = option.proOnly && !isThemeUnlocked(option.id);
        const selected = option.id === currentId;
        return (
          <button
            key={option.id}
            id={`${listId}-${option.id}`}
            type="button"
            role="option"
            aria-selected={selected}
            data-active={index === activeIndex ? "true" : "false"}
            className={UI_CLASSES.menuItem}
            onMouseEnter={() => onHover(index)}
            onClick={() => onChoose(index)}
          >
            <span
              className="popcorni-swatch"
              style={{ backgroundImage: option.gradient.button }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">{optionLabel(option, locked)}</span>
            {selected ? <Check /> : null}
          </button>
        );
      })}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        d="M5.5 7.5 10 12l4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M5 10.2 8.2 13.5 15 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
