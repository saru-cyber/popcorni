"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ComboPopup } from "@/components/ComboPopup";
import {
  PopcorniScreen,
  useSharedPopcorniTheme,
} from "@/components/popcorni/PopcorniScreen";
import {
  getVotedCount,
  incrementVotedCount,
} from "@/lib/poll-storage";
import { castVote } from "@/lib/polls";
import { PopcorniAccountFooter } from "@/components/popcorni/PopcorniAccountFooter";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { getOptionIcon } from "@/config/themes";

const COMBO_WINDOW_MS = 1800;

export default function VotePage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const { poll, loading, error } = useLivePoll(pollId);
  const { theme, surfaces } = useSharedPopcorniTheme(poll?.theme);

  const questionNumber = poll?.question_number ?? 1;
  const [votedCount, setVotedCount] = useState(0);
  const [trackedKey, setTrackedKey] = useState(`${pollId}:1`);
  const voteKey = `${pollId}:${questionNumber}`;
  if (trackedKey !== voteKey && poll) {
    setTrackedKey(voteKey);
    setVotedCount(getVotedCount(pollId, questionNumber));
  }

  const [combo, setCombo] = useState(0);
  const [votingOptionId, setVotingOptionId] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [lastTapAt, setLastTapAt] = useState(0);

  const maxVotes = poll?.max_votes_per_user ?? 5;
  const unlimited = maxVotes === -1;
  const remaining = unlimited ? Infinity : Math.max(0, maxVotes - votedCount);
  const canVote = !poll?.is_closed && (unlimited || remaining > 0);

  const remainingLabel = useMemo(() => {
    if (!poll) return "";
    if (unlimited) return `Votes cast: ${votedCount} · Unlimited`;
    return `Remaining: ${remaining} / ${maxVotes}`;
  }, [poll, unlimited, votedCount, remaining, maxVotes]);

  const handleVote = useCallback(
    async (optionId: number) => {
      if (!poll || !canVote || votingOptionId !== null) return;

      setVoteError(null);
      setVotingOptionId(optionId);

      try {
        await castVote(pollId, optionId);
        const nextCount = incrementVotedCount(pollId, poll.question_number);
        setVotedCount(nextCount);

        const now = Date.now();
        const nextCombo =
          lastTapAt && now - lastTapAt < COMBO_WINDOW_MS ? combo + 1 : 1;
        setCombo(nextCombo);
        setLastTapAt(now);
        window.setTimeout(() => {
          setCombo((c) => (c === nextCombo ? 0 : c));
        }, COMBO_WINDOW_MS);
      } catch (e) {
        setVoteError(e instanceof Error ? e.message : "Vote failed");
      } finally {
        setVotingOptionId(null);
      }
    },
    [poll, canVote, votingOptionId, pollId, lastTapAt, combo],
  );

  return (
    <PopcorniScreen mode="app" source="shared" pollThemeId={poll?.theme}>
      {loading ? (
        <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
          <p style={surfaces.muted}>Loading…</p>
        </main>
      ) : error || !poll ? (
        <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
          <p style={surfaces.error}>{error ?? "Poll not found"}</p>
        </main>
      ) : (
        <main className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col bg-transparent px-4 py-8">
          <ComboPopup combo={combo} />

          <div className="mb-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={surfaces.accent}
              >
                PollPop
              </p>
              {questionNumber >= 2 ? (
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                  style={surfaces.badge}
                >
                  Q{questionNumber}
                </span>
              ) : null}
            </div>
            <h1
              className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold leading-tight sm:text-3xl"
              style={surfaces.title}
            >
              {poll.title}
            </h1>
            <p className="mt-3 text-sm font-medium" style={surfaces.muted}>
              {remainingLabel}
            </p>
            {poll.is_closed && (
              <p className="mt-2 rounded-xl border border-rose-400/50 px-3 py-2 text-sm font-semibold" style={surfaces.error}>
                This question is closed. Waiting for the next one…
              </p>
            )}
            {!poll.is_closed && !canVote && (
              <p className="mt-2 text-sm font-semibold" style={surfaces.accent}>
                You&apos;ve used all your votes. Thanks for playing!
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-3">
            {poll.options.map((option, index) => {
              const icon = getOptionIcon(poll.theme, index);
              const busy = votingOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={!canVote || votingOptionId !== null}
                  onClick={() => void handleVote(option.id)}
                  className="min-h-[4.5rem] rounded-2xl border px-5 py-4 text-left text-lg font-bold shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
                  style={surfaces.button}
                >
                  {icon ? <span className="mr-3 text-2xl">{icon}</span> : null}
                  {busy ? "Sending…" : option.text}
                </button>
              );
            })}
          </div>

          {voteError && (
            <p className="mt-4 text-sm font-semibold" style={surfaces.error}>
              {voteError}
            </p>
          )}

          <p className="mt-8 text-center text-xs" style={surfaces.muted}>
            Tap fast for COMBO! · Votes sync live to OBS · {theme.name}
          </p>
          <PopcorniAccountFooter className="mt-8" />
        </main>
      )}
    </PopcorniScreen>
  );
}
