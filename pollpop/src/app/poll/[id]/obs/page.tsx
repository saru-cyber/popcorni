"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { getTheme } from "@/config/themes";

export default function ObsOverlayPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const { poll, counts, totalVotes, loading, error, lastBumpedOptionId, votes } =
    useLivePoll(pollId);
  const theme = getTheme(poll?.theme);
  const obs = theme.obs;

  useEffect(() => {
    document.documentElement.classList.add("obs-transparent");
    document.body.classList.add("obs-transparent");
    return () => {
      document.documentElement.classList.remove("obs-transparent");
      document.body.classList.remove("obs-transparent");
    };
  }, []);

  if (loading) {
    return (
      <main className={`${obs.bg} p-6`}>
        <p className="text-white/70 drop-shadow">Loading overlay…</p>
      </main>
    );
  }

  if (error || !poll) {
    return (
      <main className={`${obs.bg} p-6`}>
        <p className="text-rose-200 drop-shadow">{error ?? "Poll not found"}</p>
      </main>
    );
  }

  return (
    <main className={`${obs.bg} p-4 sm:p-8`}>
      <div className={`mx-auto w-full max-w-3xl ${obs.panel}`}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-[0.25em] drop-shadow ${obs.eyebrow}`}
            >
              PollPop · {theme.shortName}
            </p>
            <h1
              className={`mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold drop-shadow-md sm:text-2xl ${obs.title}`}
            >
              {poll.title}
            </h1>
          </div>
          <p
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${obs.badge}`}
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
          transparent={!obs.lightPanel}
          isClosed={poll.is_closed}
          questionNumber={poll.question_number}
        />
      </div>
    </main>
  );
}
