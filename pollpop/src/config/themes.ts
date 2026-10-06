import type { PollTheme, ThemeDefinition, ThemeTier } from "@/types/poll";

export type ChartTone = {
  label: string;
  meta: string;
  track: string;
  empty: string;
};

/** Venue lighting for projector / big-screen view */
export type ProjectionVenueMode = "dark" | "light";

/**
 * Styles for /poll/[id]/projection.
 * Future event themes (halloween, christmas, …) should customize both modes
 * so worldbuilding (palette, decor, FX) lands on the big screen in one place.
 */
export type ProjectionModeStyles = {
  bg: string;
  eyebrow: string;
  title: string;
  meta: string;
  badge: string;
  chart: ChartTone;
  barColors: string[];
  /** Strong readability on washed-out projectors */
  textShadow: string;
  qrFrame: string;
  toggleIdle: string;
  toggleActive: string;
  /** Optional event décor classes (snow, ghosts, …) */
  decor?: string;
};

export type ProjectionConfig = {
  dark: ProjectionModeStyles;
  light: ProjectionModeStyles;
};

/**
 * Single source of truth for every theme surface (create / vote / admin / OBS / projection / VFX).
 * Screens should only read from THEMES[id] — never hardcode theme colors.
 */
export type ThemeConfig = {
  id: PollTheme;
  name: string;
  shortName: string;
  tier: ThemeTier;
  freeTrialAllowed?: boolean;
  showAvatars: boolean;
  optionIcons?: readonly string[];
  barColors: string[];
  /**
   * Progress bar thickness per surface (Tailwind height classes).
   * Avatar themes stay moderate; icon-less themes use thicker bars on admin/projection.
   */
  barHeight: {
    default: string;
    admin: string;
    projection: string;
  };
  /** Chart palette for light / OBS panels */
  chart: ChartTone;
  admin: {
    /** Full-page background (incl. gradients) */
    bg: string;
    /** Card / container surface */
    cardBg: string;
    /** Default foreground */
    text: string;
    brand: string;
    live: string;
    title: string;
    meta: string;
    label: string;
    hint: string;
    badge: string;
    finishBtn: string;
    shareBtn: string;
    obsBtn: string;
    /** Projector / venue big-screen link */
    projectionBtn: string;
    /** Stage 1: close voting & reveal winner (flag / entertainment, not stop-red) */
    finishVotingBtn: string;
    /** Stage 2: go to next question compose */
    nextQuestionBtn: string;
    cta: string;
    chart: ChartTone;
  };
  obs: {
    bg: string;
    /** When true, wrap overlay content in `panel` */
    lightPanel: boolean;
    /** Panel chrome around the chart (empty = transparent overlay) */
    panel: string;
    eyebrow: string;
    title: string;
    badge: string;
  };
  /** Offline venue projector view (Dark / Light lighting modes) */
  projection: ProjectionConfig;
  vote: {
    bg: string;
    brand: string;
    title: string;
    meta: string;
    button: string;
    footer: string;
    /** High-contrast status banners (closed / exhausted / error) */
    noticeClosed: string;
    noticeExhausted: string;
    noticeError: string;
  };
  create: {
    bg: string;
    brand: string;
    live: string;
    title: string;
    subtitle: string;
    label: string;
    input: string;
    select: string;
    optionBg: string;
    cta: string;
    chevron: string;
  };
  vfx: {
    mascotBadge: string;
    winnerBanner: string;
    winnerTitle: string;
    winnerNameChip: string;
    winnerNamePlain: string;
    confetti: readonly string[];
    playWinnerSe: boolean;
  };
};

/** Shared venue lighting bases — themes override barColors / accents */
function projectionPair(
  barColors: string[],
  overrides?: Partial<{
    dark: Partial<ProjectionModeStyles>;
    light: Partial<ProjectionModeStyles>;
  }>,
): ProjectionConfig {
  const darkBase: ProjectionModeStyles = {
    bg: "min-h-screen bg-black text-white",
    eyebrow:
      "text-white/80 font-black tracking-[0.3em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
    title:
      "text-white font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]",
    meta: "text-white/85 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
    badge:
      "bg-white/15 text-white ring-1 ring-white/40 backdrop-blur drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
    chart: {
      label:
        "text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
      meta: "text-white/90 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
      track: "bg-white/15 ring-1 ring-white/20",
      empty: "text-white/60",
    },
    barColors,
    textShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
    qrFrame: "rounded-2xl bg-white p-4 shadow-[0_0_40px_rgba(255,255,255,0.15)]",
    toggleIdle: "bg-white/10 text-white/70 hover:bg-white/20",
    toggleActive: "bg-white text-black font-bold",
  };
  const lightBase: ProjectionModeStyles = {
    bg: "min-h-screen bg-white text-black",
    eyebrow:
      "text-black/70 font-black tracking-[0.3em] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]",
    title:
      "text-black font-black drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]",
    meta: "text-black/75 font-semibold",
    badge: "bg-black/90 text-white ring-1 ring-black/20",
    chart: {
      label: "text-black font-black",
      meta: "text-black/80 font-bold",
      track: "bg-black/10 ring-1 ring-black/15",
      empty: "text-black/45",
    },
    barColors,
    textShadow: "drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]",
    qrFrame: "rounded-2xl bg-white p-4 ring-2 ring-black/15 shadow-xl",
    toggleIdle: "bg-black/5 text-black/60 hover:bg-black/10",
    toggleActive: "bg-black text-white font-bold",
  };
  return {
    dark: { ...darkBase, ...overrides?.dark, barColors: overrides?.dark?.barColors ?? barColors, chart: { ...darkBase.chart, ...overrides?.dark?.chart } },
    light: { ...lightBase, ...overrides?.light, barColors: overrides?.light?.barColors ?? barColors, chart: { ...lightBase.chart, ...overrides?.light?.chart } },
  };
}

const DEFAULT_CONFETTI = ["✨", "💖", "🎉", "🌸", "⭐", "🍃"] as const;
const ANIMAL_CONFETTI = ["✨", "🍃", "🌼", "⭐", "🦊", "🍀"] as const;
const ANIMAL_ICONS = ["🐶", "🐱", "🐰", "🦊", "🐻"] as const;

export const THEMES: Record<PollTheme, ThemeConfig> = {
  dark: {
    id: "dark",
    name: "Minimal Dark",
    shortName: "Minimal Dark",
    tier: "free",
    showAvatars: false,
    barColors: [
      "bg-slate-200",
      "bg-slate-300",
      "bg-zinc-300",
      "bg-neutral-300",
      "bg-stone-300",
    ],
    barHeight: {
      default: "h-4",
      admin: "h-14",
      projection: "h-16",
    },
    chart: {
      label: "text-slate-100",
      meta: "text-slate-500",
      track: "bg-slate-800/80",
      empty: "text-slate-600",
    },
    admin: {
      bg: "min-h-screen bg-[#050505]",
      cardBg: "rounded-2xl border border-white/10 bg-zinc-900/80 p-5",
      text: "text-slate-100",
      brand: "text-slate-100 group-hover:text-white",
      live: "text-slate-600",
      title: "text-slate-50",
      meta: "text-slate-400",
      label: "text-slate-500",
      hint: "text-slate-500",
      badge: "border-slate-500/40 bg-slate-800 text-slate-200",
      finishBtn:
        "border-slate-600/70 text-slate-400 hover:border-rose-400/40 hover:text-rose-200",
      shareBtn: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
      obsBtn: "bg-orange-400 hover:bg-orange-300 text-slate-950",
      projectionBtn: "bg-violet-500 hover:bg-violet-400 text-white",
      finishVotingBtn:
        "bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-300 text-slate-950 shadow-amber-900/30",
      nextQuestionBtn:
        "bg-gradient-to-r from-cyan-400 to-sky-300 text-slate-950 shadow-cyan-900/30",
      cta: "bg-gradient-to-r from-slate-100 to-zinc-300 text-slate-950",
      chart: {
        label: "text-slate-100",
        meta: "text-slate-500",
        track: "bg-slate-800/80",
        empty: "text-slate-600",
      },
    },
    obs: {
      bg: "min-h-screen bg-transparent",
      lightPanel: false,
      panel: "",
      eyebrow: "text-white/70",
      title: "text-white",
      badge: "bg-black/50 text-white",
    },
    projection: projectionPair([
      "bg-slate-100",
      "bg-zinc-200",
      "bg-neutral-200",
      "bg-stone-200",
      "bg-slate-300",
    ]),
    vote: {
      bg: "bg-[#0a0a0a]",
      brand: "text-slate-500",
      title: "text-slate-50",
      meta: "text-slate-400",
      button:
        "border-slate-700 bg-slate-950 text-slate-100 enabled:hover:border-slate-500 enabled:hover:bg-slate-900",
      footer: "text-slate-700",
      noticeClosed:
        "rounded-xl border border-rose-400/50 bg-rose-950 px-3 py-2 text-sm font-semibold text-rose-100",
      noticeExhausted:
        "rounded-xl border border-amber-400/50 bg-amber-950 px-3 py-2 text-sm font-semibold text-amber-100",
      noticeError:
        "rounded-xl border border-rose-400/60 bg-rose-950 px-4 py-3 text-sm font-semibold text-rose-100",
    },
    create: {
      bg: "bg-[#050505] text-slate-100",
      brand: "text-slate-100 group-hover:text-white",
      live: "text-slate-600",
      title: "text-slate-50",
      subtitle: "text-slate-500",
      label: "text-slate-500",
      input:
        "border-slate-700 bg-black/40 text-slate-100 placeholder:text-slate-600 ring-slate-400/30",
      select: "border-slate-700 bg-black/40 text-slate-100 ring-slate-400/30",
      optionBg: "bg-black text-slate-100",
      cta: "bg-gradient-to-r from-slate-100 to-zinc-300 text-slate-950 shadow-black/40",
      chevron: "%2394a3b8",
    },
    vfx: {
      mascotBadge:
        "bg-slate-950/90 text-slate-50 ring-1 ring-white/20 shadow-lg",
      winnerBanner:
        "rounded-full bg-gradient-to-r from-slate-200 via-zinc-300 to-slate-100 px-5 py-2 text-center shadow-lg",
      winnerTitle: "text-slate-950",
      winnerNameChip:
        "rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-slate-950 shadow",
      winnerNamePlain: "text-slate-100 drop-shadow",
      confetti: DEFAULT_CONFETTI,
      playWinnerSe: true,
    },
  },

  light: {
    id: "light",
    name: "Light Mode",
    shortName: "Light Mode",
    tier: "free",
    showAvatars: false,
    barColors: [
      "bg-sky-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-violet-500",
    ],
    barHeight: {
      default: "h-4",
      admin: "h-14",
      projection: "h-16",
    },
    chart: {
      label: "text-slate-800",
      meta: "text-slate-500",
      track: "bg-slate-200",
      empty: "text-slate-400",
    },
    admin: {
      bg: "min-h-screen bg-[#f5f7fb]",
      cardBg: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
      text: "text-slate-900",
      brand: "text-sky-600 group-hover:text-sky-700",
      live: "text-slate-400",
      title: "text-slate-900",
      meta: "text-slate-600",
      label: "text-slate-500",
      hint: "text-slate-500",
      badge: "border-sky-200 bg-sky-50 text-sky-700",
      finishBtn:
        "border-slate-300 text-slate-500 hover:border-rose-300 hover:text-rose-500",
      shareBtn: "bg-sky-500 hover:bg-sky-400 text-white",
      obsBtn: "bg-orange-400 hover:bg-orange-300 text-slate-950",
      projectionBtn: "bg-indigo-500 hover:bg-indigo-400 text-white",
      finishVotingBtn:
        "bg-gradient-to-r from-amber-400 via-yellow-400 to-lime-400 text-slate-900 shadow-amber-200/50",
      nextQuestionBtn:
        "bg-gradient-to-r from-sky-500 to-emerald-400 text-white shadow-sky-200/50",
      cta: "bg-gradient-to-r from-sky-500 to-emerald-400 text-white",
      chart: {
        label: "text-slate-800",
        meta: "text-slate-500",
        track: "bg-slate-200",
        empty: "text-slate-400",
      },
    },
    obs: {
      bg: "min-h-screen bg-transparent",
      lightPanel: true,
      panel: "rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur",
      eyebrow: "text-slate-800/90 drop-shadow-none",
      title: "text-slate-900 drop-shadow-none",
      badge: "bg-white/85 text-slate-800",
    },
    projection: projectionPair([
      "bg-sky-600",
      "bg-emerald-600",
      "bg-amber-500",
      "bg-rose-600",
      "bg-violet-600",
    ]),
    vote: {
      bg: "bg-[#f4f7fb] text-slate-900",
      brand: "text-sky-600",
      title: "text-slate-900",
      meta: "text-slate-600",
      button:
        "border-slate-300 bg-white text-slate-900 shadow-sm enabled:hover:border-sky-400 enabled:hover:bg-sky-50",
      footer: "text-slate-400",
      noticeClosed:
        "rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-950",
      noticeExhausted:
        "rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950",
      noticeError:
        "rounded-xl border border-rose-400 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-950",
    },
    create: {
      bg: "bg-[#f5f7fb] text-slate-900",
      brand: "text-sky-600 group-hover:text-sky-700",
      live: "text-slate-400",
      title: "text-slate-900",
      subtitle: "text-slate-500",
      label: "text-slate-500",
      input:
        "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 ring-sky-400/40",
      select: "border-slate-300 bg-white text-slate-900 ring-sky-400/40",
      optionBg: "bg-white text-slate-900",
      cta: "bg-gradient-to-r from-sky-500 to-emerald-400 text-white shadow-sky-200/60",
      chevron: "%2364748b",
    },
    vfx: {
      mascotBadge:
        "bg-emerald-950/85 text-lime-50 ring-1 ring-white/25 shadow-lg",
      winnerBanner:
        "rounded-full bg-gradient-to-r from-sky-300 via-emerald-300 to-amber-300 px-5 py-2 text-center shadow-lg",
      winnerTitle: "text-slate-900",
      winnerNameChip:
        "rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-slate-900 shadow",
      winnerNamePlain: "text-sky-600 drop-shadow",
      confetti: DEFAULT_CONFETTI,
      playWinnerSe: true,
    },
  },

  game: {
    id: "game",
    name: "Game Mode",
    shortName: "Game Mode",
    tier: "free",
    showAvatars: false,
    barColors: [
      "bg-lime-400",
      "bg-fuchsia-500",
      "bg-cyan-400",
      "bg-yellow-300",
      "bg-red-500",
    ],
    barHeight: {
      default: "h-4",
      admin: "h-14",
      projection: "h-16",
    },
    chart: {
      label: "text-lime-100",
      meta: "text-fuchsia-200/80",
      track: "bg-slate-950 border border-lime-400/30",
      empty: "text-lime-500/70",
    },
    admin: {
      bg: "min-h-screen bg-[#050816] bg-[radial-gradient(ellipse_70%_50%_at_15%_0%,rgba(168,85,247,0.22),transparent)]",
      cardBg: "rounded-2xl border border-lime-400/20 bg-indigo-950/50 p-5",
      text: "text-lime-50",
      brand: "text-lime-300 group-hover:text-lime-200",
      live: "text-fuchsia-400/70",
      title: "text-lime-50",
      meta: "text-fuchsia-200/80",
      label: "text-fuchsia-200/70",
      hint: "text-lime-700",
      badge: "border-lime-400/30 bg-lime-400/10 text-lime-200",
      finishBtn:
        "border-fuchsia-500/40 text-fuchsia-200/80 hover:border-rose-400/50 hover:text-rose-200",
      shareBtn: "bg-fuchsia-500 hover:bg-fuchsia-400 text-white",
      obsBtn: "bg-lime-400 hover:bg-lime-300 text-slate-950",
      projectionBtn: "bg-cyan-400 hover:bg-cyan-300 text-slate-950",
      finishVotingBtn:
        "bg-gradient-to-r from-yellow-300 via-lime-400 to-cyan-400 text-slate-950 shadow-lime-900/40",
      nextQuestionBtn:
        "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-lime-400 text-slate-950",
      cta: "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-lime-400 text-slate-950",
      chart: {
        label: "text-lime-100",
        meta: "text-fuchsia-200/80",
        track: "bg-slate-950 border border-lime-400/30",
        empty: "text-lime-500/70",
      },
    },
    obs: {
      bg: "min-h-screen bg-transparent",
      lightPanel: false,
      panel: "",
      eyebrow: "text-lime-200",
      title: "text-white",
      badge: "bg-fuchsia-600/70 text-white",
    },
    projection: projectionPair(
      [
        "bg-lime-400",
        "bg-fuchsia-500",
        "bg-cyan-400",
        "bg-yellow-300",
        "bg-red-500",
      ],
      {
        dark: {
          bg: "min-h-screen bg-black text-lime-50 bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(217,70,239,0.25),transparent)]",
        },
      },
    ),
    vote: {
      bg: "bg-[#050816]",
      brand: "text-lime-400",
      title: "text-lime-50",
      meta: "text-fuchsia-200/80",
      button:
        "border-lime-400/40 bg-gradient-to-r from-indigo-950 to-slate-950 text-lime-50 enabled:hover:border-lime-300 enabled:hover:from-indigo-900",
      footer: "text-lime-900",
      noticeClosed:
        "rounded-xl border border-rose-400/50 bg-rose-950 px-3 py-2 text-sm font-semibold text-rose-100",
      noticeExhausted:
        "rounded-xl border border-amber-400/50 bg-amber-950 px-3 py-2 text-sm font-semibold text-amber-100",
      noticeError:
        "rounded-xl border border-rose-400/60 bg-rose-950 px-4 py-3 text-sm font-semibold text-rose-100",
    },
    create: {
      bg: "bg-[#0a0618] text-lime-50 bg-[radial-gradient(ellipse_70%_50%_at_15%_0%,rgba(168,85,247,0.28),transparent),radial-gradient(ellipse_50%_40%_at_90%_10%,rgba(34,197,94,0.16),transparent)]",
      brand: "text-lime-300 group-hover:text-lime-200",
      live: "text-fuchsia-400/70",
      title: "text-lime-50",
      subtitle: "text-fuchsia-200/70",
      label: "text-fuchsia-200/70",
      input:
        "border-fuchsia-500/40 bg-indigo-950/40 text-lime-50 placeholder:text-fuchsia-300/40 ring-lime-400/40",
      select:
        "border-fuchsia-500/40 bg-indigo-950/40 text-lime-50 ring-lime-400/40",
      optionBg: "bg-[#120826] text-lime-50",
      cta: "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-lime-400 text-slate-950 shadow-fuchsia-900/40",
      chevron: "%23d8b4fe",
    },
    vfx: {
      mascotBadge:
        "bg-indigo-950/95 text-lime-100 ring-1 ring-lime-400/40 shadow-lg",
      winnerBanner:
        "rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-lime-300 px-5 py-2 text-center shadow-lg shadow-fuchsia-900/40",
      winnerTitle: "text-slate-950",
      winnerNameChip:
        "rounded-full bg-lime-100/95 px-4 py-1 text-sm font-bold text-indigo-950 shadow",
      winnerNamePlain: "text-lime-300 drop-shadow",
      confetti: ["✨", "💥", "🎮", "⚡", "💜", "🟢"] as const,
      playWinnerSe: true,
    },
  },

  party: {
    id: "party",
    name: "Party Mode",
    shortName: "Party Mode",
    tier: "free",
    showAvatars: false,
    barColors: [
      "bg-pink-500",
      "bg-amber-400",
      "bg-cyan-400",
      "bg-yellow-400",
      "bg-violet-400",
    ],
    barHeight: {
      default: "h-4",
      admin: "h-14",
      projection: "h-16",
    },
    chart: {
      label: "text-fuchsia-900",
      meta: "text-rose-600",
      track: "bg-pink-100",
      empty: "text-rose-400",
    },
    admin: {
      bg: "min-h-screen bg-gradient-to-br from-[#fff7fb] via-[#fff1f7] to-[#fff8e7]",
      cardBg:
        "rounded-2xl border border-pink-200 bg-white/90 p-5 shadow-sm shadow-pink-100",
      text: "text-fuchsia-950",
      brand: "text-pink-500 group-hover:text-fuchsia-600",
      live: "text-amber-500",
      title: "text-fuchsia-950",
      meta: "text-rose-700",
      label: "text-rose-600",
      hint: "text-rose-400",
      badge: "border-pink-200 bg-pink-50 text-pink-600",
      finishBtn:
        "border-pink-200 text-rose-400 hover:border-rose-400 hover:text-rose-600",
      shareBtn: "bg-pink-500 hover:bg-pink-400 text-white",
      obsBtn: "bg-amber-400 hover:bg-amber-300 text-fuchsia-950",
      projectionBtn: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white",
      finishVotingBtn:
        "bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-300 text-fuchsia-950 shadow-amber-200/50",
      nextQuestionBtn:
        "bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-white",
      cta: "bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-white",
      chart: {
        label: "text-fuchsia-900",
        meta: "text-rose-600",
        track: "bg-pink-100",
        empty: "text-rose-400",
      },
    },
    obs: {
      bg: "min-h-screen bg-transparent",
      lightPanel: true,
      panel: "rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur",
      eyebrow: "text-pink-600 drop-shadow-none",
      title: "text-fuchsia-950 drop-shadow-none",
      badge: "bg-amber-300/90 text-fuchsia-950",
    },
    projection: projectionPair([
      "bg-pink-500",
      "bg-amber-400",
      "bg-cyan-500",
      "bg-yellow-400",
      "bg-violet-500",
    ]),
    vote: {
      bg: "bg-gradient-to-b from-[#fff7fb] via-[#fff1f7] to-[#fff8e7] text-fuchsia-950",
      brand: "text-pink-500",
      title: "text-fuchsia-950",
      meta: "text-rose-700",
      button:
        "border-pink-300 bg-white text-fuchsia-950 shadow-md shadow-pink-200/50 enabled:hover:border-amber-400 enabled:hover:bg-amber-50",
      footer: "text-rose-400",
      noticeClosed:
        "rounded-xl border border-rose-400 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-950",
      noticeExhausted:
        "rounded-xl border border-amber-400 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950",
      noticeError:
        "rounded-xl border border-rose-500 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-950",
    },
    create: {
      bg: "bg-gradient-to-br from-white via-[#ffe8f3] to-[#fff3c4] text-fuchsia-950",
      brand: "text-pink-500 group-hover:text-fuchsia-600",
      live: "text-amber-500",
      title: "text-fuchsia-950",
      subtitle: "text-rose-700/80",
      label: "text-rose-700",
      input:
        "border-pink-300 bg-white/90 text-fuchsia-950 placeholder:text-rose-300 ring-pink-400/50",
      select:
        "border-pink-300 bg-white/90 text-fuchsia-950 ring-cyan-400/40",
      optionBg: "bg-white text-fuchsia-950",
      cta: "bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 text-white shadow-pink-300/50",
      chevron: "%23db2777",
    },
    vfx: {
      mascotBadge:
        "bg-fuchsia-950/90 text-pink-50 ring-1 ring-pink-200/40 shadow-lg",
      winnerBanner:
        "rounded-full bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 px-5 py-2 text-center shadow-lg shadow-pink-200/50",
      winnerTitle: "text-fuchsia-950",
      winnerNameChip:
        "rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-fuchsia-950 shadow",
      winnerNamePlain: "text-pink-500 drop-shadow",
      confetti: DEFAULT_CONFETTI,
      playWinnerSe: true,
    },
  },

  animal_race: {
    id: "animal_race",
    name: "Animal Race 🦊",
    shortName: "Animal Race",
    tier: "pro",
    freeTrialAllowed: true,
    showAvatars: true,
    optionIcons: ANIMAL_ICONS,
    barColors: [
      "bg-amber-400",
      "bg-lime-400",
      "bg-emerald-400",
      "bg-orange-300",
      "bg-teal-300",
    ],
    barHeight: {
      default: "h-10",
      admin: "h-12",
      projection: "h-10",
    },
    chart: {
      label: "text-emerald-950",
      meta: "text-lime-800/80",
      track: "bg-emerald-100/80",
      empty: "text-emerald-700/60",
    },
    admin: {
      bg: "min-h-screen bg-[#0f231c] bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(132,204,22,0.12),transparent),radial-gradient(ellipse_50%_40%_at_90%_0%,rgba(180,83,9,0.1),transparent)]",
      cardBg:
        "rounded-2xl border border-emerald-500/15 bg-[#1c382e] p-5 shadow-lg shadow-black/20",
      text: "text-lime-50",
      brand: "text-lime-300 group-hover:text-lime-200",
      live: "text-amber-500/80",
      title: "text-lime-50",
      meta: "text-emerald-200/80",
      label: "text-emerald-300/80",
      hint: "text-emerald-400/60",
      badge: "border-lime-400/30 bg-lime-400/10 text-lime-200",
      finishBtn:
        "border-emerald-600/50 text-emerald-300/80 hover:border-rose-400/40 hover:text-rose-200",
      shareBtn:
        "bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-emerald-900/20",
      obsBtn: "bg-amber-400 hover:bg-amber-300 text-amber-950",
      projectionBtn:
        "bg-lime-400 hover:bg-lime-300 text-emerald-950 shadow-emerald-900/20",
      finishVotingBtn:
        "bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-400 text-emerald-950 shadow-amber-900/25",
      nextQuestionBtn:
        "bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-300 text-emerald-950 shadow-emerald-900/30",
      cta: "bg-gradient-to-r from-lime-400 via-emerald-400 to-amber-300 text-emerald-950 shadow-emerald-900/30",
      chart: {
        label: "text-lime-100",
        meta: "text-emerald-200/80",
        track: "bg-[#142921]",
        empty: "text-emerald-400/50",
      },
    },
    obs: {
      bg: "min-h-screen bg-transparent",
      lightPanel: true,
      panel:
        "rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-[#f3faee]/95 via-[#f8f4e8]/95 to-[#e8f5e0]/95 p-5 shadow-lg shadow-emerald-200/30 backdrop-blur",
      eyebrow: "text-emerald-700 drop-shadow-none",
      title: "text-emerald-950 drop-shadow-none",
      badge: "bg-lime-200/90 text-emerald-900",
    },
    projection: projectionPair(
      [
        "bg-amber-400",
        "bg-lime-400",
        "bg-emerald-400",
        "bg-orange-300",
        "bg-teal-300",
      ],
      {
        dark: {
          bg: "min-h-screen bg-black text-lime-50 bg-[radial-gradient(ellipse_70%_45%_at_20%_-10%,rgba(132,204,22,0.2),transparent)]",
          decor: "animal-race-projection-dark",
        },
        light: {
          bg: "min-h-screen bg-[#f7fbf2] text-emerald-950",
          decor: "animal-race-projection-light",
        },
      },
    ),
    vote: {
      bg: "bg-gradient-to-b from-[#eef8e8] via-[#f7f3e8] to-[#e8f5e4] text-emerald-950",
      brand: "text-emerald-600",
      title: "text-emerald-950",
      meta: "text-lime-800",
      button:
        "border-emerald-200 bg-white/90 text-emerald-950 shadow-sm shadow-emerald-200/40 enabled:hover:border-lime-400 enabled:hover:bg-lime-50",
      footer: "text-emerald-700/50",
      noticeClosed:
        "rounded-xl border border-rose-400 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-950",
      noticeExhausted:
        "rounded-xl border border-amber-500 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950",
      noticeError:
        "rounded-xl border border-rose-500 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-950",
    },
    create: {
      bg: "bg-gradient-to-br from-[#f4faf0] via-[#eef6e4] to-[#f8f1e2] text-emerald-950",
      brand: "text-emerald-600 group-hover:text-lime-600",
      live: "text-amber-700/70",
      title: "text-emerald-950",
      subtitle: "text-lime-800/80",
      label: "text-emerald-800/80",
      input:
        "border-emerald-200 bg-white/85 text-emerald-950 placeholder:text-emerald-700/40 ring-lime-400/40",
      select:
        "border-emerald-200 bg-white/85 text-emerald-950 ring-lime-400/40",
      optionBg: "bg-white text-emerald-950",
      cta: "bg-gradient-to-r from-lime-400 via-emerald-400 to-amber-300 text-emerald-950 shadow-emerald-200/50",
      chevron: "%2365a30d",
    },
    vfx: {
      mascotBadge:
        "bg-emerald-950/95 text-lime-50 ring-1 ring-lime-300/40 shadow-lg",
      winnerBanner:
        "rounded-full bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-300 px-5 py-2 text-center shadow-lg shadow-amber-200/40",
      winnerTitle: "text-emerald-950",
      winnerNameChip:
        "rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-emerald-950 shadow",
      winnerNamePlain: "text-emerald-700 drop-shadow",
      confetti: ANIMAL_CONFETTI,
      playWinnerSe: true,
    },
  },
};

const LEGACY_THEME_MAP: Record<string, PollTheme> = {
  gacha: "party",
  neon_rgb: "game",
};

export function normalizeTheme(theme: unknown): PollTheme {
  if (typeof theme === "string" && theme in THEMES) {
    return theme as PollTheme;
  }
  if (typeof theme === "string" && theme in LEGACY_THEME_MAP) {
    return LEGACY_THEME_MAP[theme];
  }
  return "dark";
}

/** Primary accessor: THEMES[id] with legacy / fallback normalization */
export function getTheme(theme: unknown): ThemeConfig {
  return THEMES[normalizeTheme(theme)];
}

export function getProjectionStyles(
  theme: unknown,
  mode: ProjectionVenueMode,
): ProjectionModeStyles {
  return getTheme(theme).projection[mode];
}

export function normalizeProjectionMode(
  value: unknown,
): ProjectionVenueMode {
  return value === "light" ? "light" : "dark";
}

/** @deprecated Prefer getTheme / THEMES */
export function getThemeVisuals(theme: unknown): ThemeConfig {
  return getTheme(theme);
}

export function getThemeDefinition(
  theme: PollTheme,
): ThemeDefinition | undefined {
  return THEME_DEFINITIONS.find((t) => t.value === theme);
}

export function canUseTheme(theme: PollTheme, isPro = false): boolean {
  const def = getThemeDefinition(theme);
  if (!def) return false;
  if (def.tier === "free") return true;
  if (isPro) return true;
  return Boolean(def.freeTrialAllowed);
}

export function getOptionIcon(theme: unknown, index: number): string | null {
  const config = getTheme(theme);
  if (!config.showAvatars || !config.optionIcons?.length) return null;
  return config.optionIcons[index % config.optionIcons.length];
}

export const THEME_DEFINITIONS: ThemeDefinition[] = (
  Object.values(THEMES) as ThemeConfig[]
).map((t) => ({
  value: t.id,
  label: t.name,
  tier: t.tier,
  ...(t.freeTrialAllowed ? { freeTrialAllowed: true } : {}),
}));

export const THEME_OPTIONS: { value: PollTheme; label: string }[] =
  THEME_DEFINITIONS.map(({ value, label }) => ({ value, label }));

export const FREE_THEMES = THEME_DEFINITIONS.filter((t) => t.tier === "free").map(
  (t) => t.value,
);

export const PRO_THEMES = THEME_DEFINITIONS.filter((t) => t.tier === "pro").map(
  (t) => t.value,
);

/** @deprecated Use getTheme(theme).optionIcons */
export { ANIMAL_ICONS };
