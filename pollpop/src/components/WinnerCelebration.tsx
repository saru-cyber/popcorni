"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTheme } from "@/config/themes";
import { resolveWinners } from "@/lib/winners";
import type { PollOption, PollTheme, VoteCounts } from "@/types/poll";

type WinnerCelebrationProps = {
  open: boolean;
  options: PollOption[];
  counts: VoteCounts;
  theme: PollTheme | string;
  showAvatar: boolean;
  /** Projector / venue scale */
  size?: "default" | "projection";
};

function playWinnerPop() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + i * 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 0.45 + i * 0.05);
    });
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // Autoplay / AudioContext may be blocked — ignore.
  }
}

export function WinnerCelebration({
  open,
  options,
  counts,
  theme,
  showAvatar,
  size = "default",
}: WinnerCelebrationProps) {
  const themeConfig = getTheme(theme);
  const vfx = themeConfig.vfx;
  const isProjection = size === "projection";

  const confetti = useMemo(
    () =>
      Array.from({ length: isProjection ? 48 : 28 }, (_, i) => ({
        id: i,
        emoji: vfx.confetti[i % vfx.confetti.length],
        x: ((i * 37) % 100) - 50,
        delay: (i % 8) * 0.05,
        duration: 1.4 + (i % 5) * 0.15,
      })),
    [vfx.confetti, isProjection],
  );

  const result = useMemo(
    () => resolveWinners(options, counts, theme, showAvatar),
    [options, counts, theme, showAvatar],
  );

  useEffect(() => {
    if (!open || !result || !vfx.playWinnerSe) return;
    playWinnerPop();
  }, [open, result, vfx.playWinnerSe]);

  const headlineSize = isProjection
    ? result?.kind === "draw"
      ? "text-3xl sm:text-5xl"
      : "text-4xl sm:text-6xl"
    : result?.kind === "draw"
      ? "text-lg sm:text-2xl"
      : "text-2xl sm:text-3xl";

  const multi = (result?.topOptions.length ?? 0) > 1;
  const iconSize = isProjection
    ? multi
      ? "text-6xl sm:text-7xl"
      : "text-8xl sm:text-9xl"
    : multi
      ? "text-4xl sm:text-5xl"
      : "text-7xl sm:text-8xl";

  return (
    <AnimatePresence>
      {open && result && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute left-1/2 top-3 z-50 -translate-x-1/2"
            initial={{ y: -40, scale: 0.7, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
          >
            <div
              className={`${vfx.winnerBanner} max-w-[min(94vw,40rem)] ${
                isProjection ? "px-8 py-4 sm:px-10 sm:py-5" : ""
              }`}
            >
              <p
                className={`font-[family-name:var(--font-display)] font-black tracking-[0.2em] ${
                  isProjection ? "text-base sm:text-xl" : "text-sm sm:text-base"
                } ${vfx.winnerTitle}`}
              >
                {result.subline}
              </p>
              <p
                className={`font-[family-name:var(--font-display)] font-black ${headlineSize} ${vfx.winnerTitle}`}
              >
                {result.kind === "no_votes" ? (
                  result.headline
                ) : result.kind === "all" ? (
                  <>👑 {result.headline}</>
                ) : result.kind === "draw" ? (
                  <>👑 {result.headline}</>
                ) : (
                  result.headline
                )}
              </p>
            </div>
          </motion.div>

          {confetti.map((piece) => (
            <motion.span
              key={piece.id}
              className="absolute left-1/2 top-1/3 text-lg sm:text-xl"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0.4,
                rotate: 0,
              }}
              animate={{
                x: piece.x * 4,
                y: [0, -40 - (piece.id % 5) * 12, 120 + (piece.id % 7) * 18],
                opacity: [0, 1, 1, 0],
                scale: [0.4, 1.2, 1, 0.8],
                rotate: [-20, 40, -10],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
            >
              {piece.emoji}
            </motion.span>
          ))}

          {showAvatar && result.topOptions.some((t) => t.icon) ? (
            <motion.div
              className="absolute left-1/2 top-1/2 z-50 flex max-w-[94%] -translate-x-1/2 -translate-y-1/2 flex-wrap items-end justify-center gap-3 sm:gap-4"
              initial={{ scale: 0.2, y: 40, opacity: 0 }}
              animate={{
                scale: [0.2, 1.2, 1],
                y: [40, -8, 0],
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 12 }}
            >
              {result.topOptions.map((top, i) =>
                top.icon ? (
                  <motion.div
                    key={top.option.id}
                    className="relative flex flex-col items-center"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * i, type: "spring" }}
                  >
                    <span
                      className={`mascot-winner inline-block drop-shadow-xl ${iconSize}`}
                      aria-hidden
                    >
                      {top.icon}
                    </span>
                    <p
                      className={`mt-2 max-w-[7.5rem] truncate text-center sm:max-w-[9rem] ${vfx.winnerNameChip}`}
                    >
                      {top.option.text}
                    </p>
                  </motion.div>
                ) : null,
              )}
            </motion.div>
          ) : (
            <motion.div
              className="absolute left-1/2 top-[42%] z-50 flex max-w-[90%] -translate-x-1/2 flex-col items-center gap-2"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.1, 1], opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 14 }}
            >
              {result.kind === "single" ? (
                <p
                  className={`truncate text-center font-[family-name:var(--font-display)] text-2xl font-black sm:text-3xl ${vfx.winnerNamePlain}`}
                >
                  {result.topOptions[0]?.option.text}
                </p>
              ) : result.kind === "no_votes" ? (
                <p
                  className={`text-center font-[family-name:var(--font-display)] text-lg font-bold sm:text-xl ${vfx.winnerNamePlain}`}
                >
                  Close voting still works — try again next round!
                </p>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {result.topOptions.map((top) => (
                    <p
                      key={top.option.id}
                      className={`max-w-[10rem] truncate px-3 py-1 text-center ${vfx.winnerNameChip}`}
                    >
                      {top.option.text}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
