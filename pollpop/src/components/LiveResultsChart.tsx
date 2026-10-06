"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WinnerCelebration } from "@/components/WinnerCelebration";
import { getOptionIcon, getTheme } from "@/config/themes";
import { isWinningOption, resolveWinners } from "@/lib/winners";
import type { PollOption, PollTheme, Vote, VoteCounts } from "@/types/poll";

const SLEEP_IDLE_MS = 30_000;
const JUMP_MS = 2_000;

type LiveResultsChartProps = {
  options: PollOption[];
  counts: VoteCounts;
  totalVotes: number;
  theme?: PollTheme | string;
  /** Votes-per-voter limit */
  votesPerVoter?: number;
  votes?: Vote[];
  showAnimals?: boolean;
  bumpedOptionId?: number | null;
  transparent?: boolean;
  /** Use admin chart palette, or projection venue scale */
  surface?: "default" | "admin" | "projection";
  /** Required when surface is projection */
  projectionMode?: "dark" | "light";
  isClosed?: boolean;
  questionNumber?: number;
  /** Popcorni Pro rainbow winner treatment */
  premiumFx?: boolean;
  /** Override chart ink so it stays readable on a Popcorni surface */
  chrome?: {
    label: string;
    meta: string;
    track: string;
    empty: string;
    shadow?: string;
    accent?: string;
  };
};

type RankKind = "first" | "second" | "lowest" | null;

function computeRanks(
  options: PollOption[],
  counts: VoteCounts,
  totalVotes: number,
): Record<number, RankKind> {
  const ranks: Record<number, RankKind> = {};
  if (options.length === 0) return ranks;

  if (totalVotes === 0) {
    for (const option of options) ranks[option.id] = "lowest";
    return ranks;
  }

  const tallies = options.map((o) => ({
    id: o.id,
    votes: counts[o.id] ?? 0,
  }));
  const unique = [...new Set(tallies.map((t) => t.votes))].sort((a, b) => b - a);
  const first = unique[0] ?? 0;
  const second = unique.length > 1 ? unique[1] : null;
  const lowest = unique[unique.length - 1] ?? 0;

  for (const { id, votes } of tallies) {
    if (votes === first) ranks[id] = "first";
    else if (second !== null && votes === second) ranks[id] = "second";
    else if (votes === lowest) ranks[id] = "lowest";
    else ranks[id] = null;
  }
  return ranks;
}

function lastVoteTimesFromLog(votes: Vote[]): Record<number, number> {
  const merged: Record<number, number> = {};
  for (const vote of votes) {
    const ts = Date.parse(vote.created_at);
    if (!Number.isFinite(ts)) continue;
    merged[vote.option_id] = Math.max(merged[vote.option_id] ?? 0, ts);
  }
  return merged;
}

export function LiveResultsChart({
  options,
  counts,
  totalVotes,
  theme = "animal_race",
  votesPerVoter = 5,
  votes = [],
  showAnimals,
  bumpedOptionId = null,
  transparent = false,
  surface = "default",
  projectionMode = "dark",
  isClosed = false,
  questionNumber = 1,
  premiumFx = false,
  chrome,
}: LiveResultsChartProps) {
  const themeConfig = getTheme(theme);
  const projection = themeConfig.projection[projectionMode];
  const chartTone =
    surface === "projection"
      ? projection.chart
      : surface === "admin" && !transparent
        ? themeConfig.admin.chart
        : themeConfig.chart;
  const activeBarColors =
    surface === "projection" ? projection.barColors : themeConfig.barColors;
  const useAvatars = showAnimals ?? themeConfig.showAvatars;
  const compactAdmin = surface === "admin";
  const isProjection = surface === "projection";
  const maxVotesInPoll = Math.max(
    0,
    ...options.map((o) => counts[o.id] ?? 0),
  );
  const voterScale = votesPerVoter > 0 ? votesPerVoter * 2 : 0;
  const maxScale = Math.max(voterScale, maxVotesInPoll * 1.2, 1);

  const barHeight =
    surface === "projection"
      ? themeConfig.barHeight.projection
      : surface === "admin"
        ? themeConfig.barHeight.admin
        : themeConfig.barHeight.default;
  const iconSize = isProjection
    ? "text-3xl"
    : compactAdmin
      ? "text-3xl sm:text-4xl"
      : "text-2xl";
  const rowGap = isProjection
    ? "gap-2"
    : compactAdmin
      ? useAvatars
        ? "gap-2"
        : "gap-3"
      : useAvatars
        ? "gap-6"
        : "gap-4";
  /** Above-bar badge needs top pad; admin/projection put badge beside mascot */
  const labelPad =
    useAvatars && !compactAdmin && !isProjection ? "pt-6" : undefined;
  const badgeBeside = compactAdmin || isProjection;
  const distributeRows = compactAdmin || isProjection;

  const [now, setNow] = useState(0);
  const [clockOrigin, setClockOrigin] = useState(0);
  const [clientLastVotes, setClientLastVotes] = useState<Record<number, number>>(
    {},
  );
  const [jumpUntil, setJumpUntil] = useState<Record<number, number>>({});
  const [winnerActive, setWinnerActive] = useState(false);

  const logLastVotes = useMemo(() => lastVoteTimesFromLog(votes), [votes]);

  useEffect(() => {
    const start = Date.now();
    const boot = window.setTimeout(() => {
      setClockOrigin(start);
      setNow(start);
    }, 0);
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (bumpedOptionId == null) return;
    const t = Date.now();
    const frame = window.setTimeout(() => {
      setClientLastVotes((prev) => ({ ...prev, [bumpedOptionId]: t }));
      setJumpUntil((prev) => ({ ...prev, [bumpedOptionId]: t + JUMP_MS }));
      setNow(Date.now());
    }, 0);
    return () => window.clearTimeout(frame);
  }, [bumpedOptionId]);

  useEffect(() => {
    if (isClosed) {
      const t = window.setTimeout(() => setWinnerActive(true), 0);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setWinnerActive(false), 0);
    return () => window.clearTimeout(t);
  }, [isClosed, questionNumber]);

  const ranks = useMemo(
    () => computeRanks(options, counts, totalVotes),
    [options, counts, totalVotes],
  );

  const winnerResult = useMemo(
    () => resolveWinners(options, counts, theme, useAvatars),
    [options, counts, theme, useAvatars],
  );

  const labelClass = chrome
    ? ""
    : transparent
      ? "text-white drop-shadow"
      : chartTone.label;
  const metaClass = chrome
    ? ""
    : transparent
      ? "text-white/90 drop-shadow"
      : chartTone.meta;
  const trackClass = chrome ? "" : transparent ? "bg-white/20" : chartTone.track;
  const emptyClass = chrome ? "" : transparent ? "text-white/70" : chartTone.empty;
  const labelStyle = chrome
    ? { color: chrome.label, textShadow: chrome.shadow }
    : undefined;
  const metaStyle = chrome
    ? { color: chrome.meta, textShadow: chrome.shadow }
    : undefined;
  const trackStyle = chrome
    ? {
        backgroundColor: chrome.track,
        boxShadow: chrome.accent
          ? `inset 0 0 0 1px ${chrome.accent}`
          : undefined,
      }
    : undefined;
  const badgeClass = themeConfig.vfx.mascotBadge;

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden ${
        distributeRows ? "h-full justify-between" : ""
      } ${rowGap}`}
    >
      <WinnerCelebration
        open={winnerActive}
        options={options}
        counts={counts}
        theme={theme}
        showAvatar={useAvatars}
        size={isProjection ? "projection" : "default"}
      />

      {options.map((option, index) => {
        const optionVotes = counts[option.id] ?? 0;
        const sharePct =
          totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
        const widthPercent = (optionVotes / maxScale) * 100;
        const icon = useAvatars ? getOptionIcon(theme, index) : null;
        const barColor =
          activeBarColors[index % activeBarColors.length];

        const rank = ranks[option.id] ?? null;
        const lastAt = Math.max(
          logLastVotes[option.id] ?? 0,
          clientLastVotes[option.id] ?? 0,
        );
        const idleMs =
          lastAt > 0
            ? now - lastAt
            : now > 0 && clockOrigin > 0
              ? now - clockOrigin
              : 0;
        const isSleeping =
          !winnerActive &&
          now > 0 &&
          (rank === "lowest" || optionVotes === 0) &&
          idleMs >= SLEEP_IDLE_MS &&
          rank !== "first";
        const isJumping =
          !winnerActive && (jumpUntil[option.id] ?? 0) > now;
        const isChasing =
          !winnerActive && rank === "second" && !isSleeping && !isJumping;
        const isWinnerOption =
          winnerActive && isWinningOption(winnerResult, option.id);
        const isWinnerBar = isWinnerOption;
        const displayWidth =
          isWinnerBar && optionVotes === 0 ? 100 : widthPercent;

        let badge: string | null = null;
        if (!winnerActive) {
          if (isSleeping) badge = "💤 zZz...";
          else if (rank === "first" && totalVotes > 0) badge = "👑 Leading!";
          else if (rank === "second") badge = "🔥 Come on!!";
        }

        let mascotAnim = "";
        if (isWinnerOption) mascotAnim = "mascot-winner";
        else if (isJumping) mascotAnim = "mascot-jump";
        else if (isSleeping) mascotAnim = "mascot-sleep";
        else if (isChasing) mascotAnim = "mascot-chase";

        return (
          <div
            key={option.id}
            className={
              distributeRows
                ? "relative flex min-h-0 flex-1 flex-col justify-center"
                : "relative shrink-0"
            }
          >
            <div
              className={`flex items-baseline justify-between gap-2 ${
                compactAdmin || isProjection ? "mb-1" : "mb-1.5"
              }`}
            >
              <span
                className={`relative z-10 min-w-0 truncate font-black tracking-tight ${
                  isProjection
                    ? "text-base sm:text-xl lg:text-2xl"
                    : compactAdmin
                      ? "text-base font-bold sm:text-lg"
                      : "text-sm font-bold"
                } ${labelClass} ${isProjection ? projection.textShadow : ""}`}
                style={labelStyle}
              >
                {option.text}
              </span>
              <span
                className={`relative z-10 shrink-0 font-bold tabular-nums ${
                  isProjection
                    ? "text-sm sm:text-lg lg:text-xl"
                    : compactAdmin
                      ? "text-sm sm:text-base"
                      : "text-xs font-medium"
                } ${metaClass} ${isProjection ? projection.textShadow : ""}`}
                style={metaStyle}
              >
                {optionVotes} ({sharePct.toFixed(0)}%)
              </span>
            </div>

            <div className={labelPad}>
              <div
                className={`relative overflow-visible rounded-full ${barHeight} ${trackClass}`}
                style={trackStyle}
              >
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out ${
                    isWinnerBar
                      ? premiumFx
                        ? "winner-bar-rainbow"
                        : "winner-bar-pulse"
                      : barColor
                  }`}
                  style={{ width: `${displayWidth}%` }}
                />

                {useAvatars && icon && (!winnerActive || isWinnerOption) && (
                  <div
                    className="absolute top-1/2 z-10 -translate-y-1/2 transition-[left] duration-500 ease-out"
                    style={{
                      left: `calc(${displayWidth}% - ${compactAdmin ? "1.25rem" : "1rem"})`,
                    }}
                  >
                    <div className="relative">
                      <AnimatePresence>
                        {badge && (
                          <motion.span
                            key={badge}
                            initial={{ opacity: 0, y: 4, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`mascot-badge absolute z-20 whitespace-nowrap rounded-full font-bold leading-none ${badgeClass} ${
                              compactAdmin
                                ? "px-2 py-1 text-[11px] sm:text-xs"
                                : "px-1.5 py-0.5 text-[9px]"
                            } ${
                              badgeBeside
                                ? "left-full top-1/2 ml-1.5 -translate-y-1/2"
                                : "bottom-full left-1/2 mb-1 -translate-x-1/2"
                            }`}
                          >
                            {badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span
                        className={`inline-block drop-shadow-lg ${iconSize} ${mascotAnim}`}
                        aria-hidden
                      >
                        {icon}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {totalVotes === 0 && !winnerActive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center ${compactAdmin ? "text-xs" : "text-sm"} ${emptyClass}`}
            style={
              chrome
                ? { color: chrome.empty, textShadow: chrome.shadow }
                : undefined
            }
          >
            Waiting for votes…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
