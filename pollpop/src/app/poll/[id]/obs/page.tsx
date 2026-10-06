"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import {
  PopcorniScreen,
  obsChartChrome,
  obsTextShadow,
  useSharedPopcorniTheme,
} from "@/components/popcorni/PopcorniScreen";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { readPremiumQuery } from "@/lib/popcorni/screenTheme";

function subscribeQuery() {
  return () => {};
}

export default function ObsOverlayPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const { poll, counts, totalVotes, loading, error, lastBumpedOptionId, votes } =
    useLivePoll(pollId);
  const { theme } = useSharedPopcorniTheme(poll?.theme);
  const premiumFromUrl = useSyncExternalStore(
    subscribeQuery,
    readPremiumQuery,
    () => false,
  );
  const chrome = obsChartChrome(theme);
  const shadow = obsTextShadow(theme);

  useEffect(() => {
    document.documentElement.classList.add("obs-transparent");
    document.body.classList.add("obs-transparent");
    return () => {
      document.documentElement.classList.remove("obs-transparent");
      document.body.classList.remove("obs-transparent");
    };
  }, []);

  const shell = (body: ReactNode) => (
    <PopcorniScreen
      mode="obs"
      source="shared"
      pollThemeId={poll?.theme}
      className="bg-transparent"
    >
      {body}
    </PopcorniScreen>
  );

  if (loading) {
    return shell(
      <main className="bg-transparent p-6">
        <p className="drop-shadow" style={{ color: chrome.label, textShadow: shadow }}>
          Loading overlay…
        </p>
      </main>,
    );
  }

  if (error || !poll) {
    return shell(
      <main className="bg-transparent p-6">
        <p className="drop-shadow" style={{ color: "#fecdd3", textShadow: shadow }}>
          {error ?? "Poll not found"}
        </p>
      </main>,
    );
  }

  return shell(
    <main className="bg-transparent p-4 sm:p-8">
      <div className="mx-auto w-full max-w-3xl bg-transparent">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: theme.colors.accent, textShadow: shadow }}
            >
              PollPop · {theme.name}
            </p>
            <h1
              className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold sm:text-2xl"
              style={{ color: chrome.label, textShadow: shadow }}
            >
              {poll.title}
            </h1>
          </div>
          <p
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.accentForeground,
              boxShadow: theme.effects.hoverGlow,
            }}
          >
            {totalVotes} votes
            {poll.is_closed ? " · CLOSED" : ""}
            {poll.question_number >= 2 ? ` · Q${poll.question_number}` : ""}
          </p>
        </div>

        <LiveResultsChart
          options={poll.options}
          counts={counts}
          totalVotes={totalVotes}
          theme={poll.theme}
          votesPerVoter={poll.max_votes_per_user}
          votes={votes}
          bumpedOptionId={lastBumpedOptionId}
          transparent
          isClosed={poll.is_closed}
          questionNumber={poll.question_number}
          premiumFx={premiumFromUrl || poll.enable_super_votes}
          chrome={chrome}
        />
      </div>
    </main>,
  );
}
