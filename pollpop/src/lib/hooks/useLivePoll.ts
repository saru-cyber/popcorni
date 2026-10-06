"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { aggregateCounts, fetchPoll, fetchVotes } from "@/lib/polls";
import { normalizeTheme } from "@/lib/themes";
import type { Poll, Vote, VoteCounts } from "@/types/poll";

type UseLivePollResult = {
  poll: Poll | null;
  votes: Vote[];
  counts: VoteCounts;
  totalVotes: number;
  loading: boolean;
  error: string | null;
  lastBumpedOptionId: number | null;
  refresh: () => Promise<void>;
};

export function useLivePoll(pollId: string): UseLivePollResult {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastBumpedOptionId, setLastBumpedOptionId] = useState<number | null>(
    null,
  );
  const bumpTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, v] = await Promise.all([fetchPoll(pollId), fetchVotes(pollId)]);
      setPoll(p);
      setVotes(v);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load poll");
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [p, v] = await Promise.all([
          fetchPoll(pollId),
          fetchVotes(pollId),
        ]);
        if (cancelled) return;
        setPoll(p);
        setVotes(v);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load poll");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null =
      null;

    try {
      const supabase = getSupabase();
      channel = supabase
        .channel(`poll-live-${pollId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "votes",
            filter: `poll_id=eq.${pollId}`,
          },
          (payload) => {
            const vote = payload.new as Vote;
            setVotes((prev) => [...prev, vote]);
            setLastBumpedOptionId(vote.option_id);
            if (bumpTimer.current) window.clearTimeout(bumpTimer.current);
            bumpTimer.current = window.setTimeout(() => {
              setLastBumpedOptionId(null);
            }, 600);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "polls",
            filter: `id=eq.${pollId}`,
          },
          (payload) => {
            const row = payload.new as Poll;
            setPoll({
              ...row,
              theme: normalizeTheme(row.theme),
              options: row.options,
              manual_votes: row.manual_votes ?? {},
            });
          },
        )
        .subscribe();
    } catch (e) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- config error path
      setError(e instanceof Error ? e.message : "Realtime connection failed");
    }

    return () => {
      if (bumpTimer.current) window.clearTimeout(bumpTimer.current);
      if (channel) {
        getSupabase().removeChannel(channel).catch(() => undefined);
      }
    };
  }, [pollId]);

  const counts = aggregateCounts(votes, poll?.manual_votes ?? {});
  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    poll,
    votes,
    counts,
    totalVotes,
    loading,
    error,
    lastBumpedOptionId,
    refresh,
  };
}
