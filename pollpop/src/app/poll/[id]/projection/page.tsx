"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  getTheme,
  normalizeProjectionMode,
  type ProjectionVenueMode,
} from "@/config/themes";

const MODE_STORAGE_KEY = "pollpop_projection_mode";

function ProjectionView() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { poll, counts, totalVotes, loading, error, lastBumpedOptionId, votes } =
    useLivePoll(pollId);

  const queryMode = searchParams.get("mode");
  const [mode, setMode] = useState<ProjectionVenueMode>(() =>
    normalizeProjectionMode(queryMode),
  );

  useEffect(() => {
    if (queryMode === "dark" || queryMode === "light") {
      setMode(queryMode);
      try {
        localStorage.setItem(MODE_STORAGE_KEY, queryMode);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      if (saved === "dark" || saved === "light") setMode(saved);
    } catch {
      /* ignore */
    }
  }, [queryMode]);

  const setVenueMode = useCallback(
    (next: ProjectionVenueMode) => {
      setMode(next);
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      const url = new URL(window.location.href);
      url.searchParams.set("mode", next);
      router.replace(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    },
    [router],
  );

  const theme = getTheme(poll?.theme);
  const projection = theme.projection[mode];

  const voteUrl = useMemo(() => {
    const base = getAppBaseUrl();
    return base ? `${base}/poll/${pollId}` : "";
  }, [pollId]);

  useEffect(() => {
    document.body.classList.add("projection-shell");
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("projection-shell");
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  if (loading) {
    return (
      <main className={`${projection.bg} flex items-center justify-center`}>
        <p className={`text-2xl font-bold ${projection.meta}`}>Loading…</p>
      </main>
    );
  }

  if (error || !poll) {
    return (
      <main className={`${projection.bg} flex items-center justify-center p-8`}>
        <p className="text-2xl font-bold text-rose-500">
          {error ?? "Poll not found"}
        </p>
      </main>
    );
  }

  const questionNumber = poll.question_number ?? 1;

  return (
    <main
      className={`${projection.bg} relative flex h-screen max-h-screen flex-col overflow-hidden ${projection.decor ?? ""}`}
      data-projection-mode={mode}
      data-theme={theme.id}
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden px-5 py-3 sm:px-8 sm:py-4 lg:px-12">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-1">
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] leading-none sm:text-xs ${projection.eyebrow}`}>
              POLLPOP · {theme.shortName} · PROJECTION
            </p>
            <h1
              className={`mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight sm:text-3xl lg:text-4xl ${projection.title}`}
            >
              {poll.title}
            </h1>
            <p
              className={`mt-0.5 text-sm font-semibold sm:text-base ${projection.meta}`}
            >
              {totalVotes} votes
              {poll.is_closed ? " · CLOSED" : " · LIVE"}
              {questionNumber >= 2 ? ` · Q${questionNumber}` : ""}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div
              className="flex rounded-full p-0.5 ring-1 ring-current/20"
              role="group"
              aria-label="Venue lighting mode"
            >
              <button
                type="button"
                onClick={() => setVenueMode("dark")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                  mode === "dark"
                    ? projection.toggleActive
                    : projection.toggleIdle
                }`}
              >
                🌑 Dark Venue
              </button>
              <button
                type="button"
                onClick={() => setVenueMode("light")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                  mode === "light"
                    ? projection.toggleActive
                    : projection.toggleIdle
                }`}
              >
                ☀️ Light Venue
              </button>
            </div>
            <p className={`text-[10px] ${projection.meta}`}>
              Tip: press F11 for fullscreen
            </p>
          </div>
        </header>

        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:mt-3 lg:flex-row lg:items-center lg:gap-8">
          <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <LiveResultsChart
              options={poll.options}
              counts={counts}
              totalVotes={totalVotes}
              theme={poll.theme}
              surface="projection"
              projectionMode={mode}
              votesPerVoter={poll.max_votes_per_user}
              votes={votes}
              bumpedOptionId={lastBumpedOptionId}
              isClosed={poll.is_closed}
              questionNumber={poll.question_number}
            />
          </section>

          <aside className="flex shrink-0 flex-col items-center justify-center gap-2 lg:self-center">
            <div className={projection.qrFrame}>
              {voteUrl ? (
                <QRCodeSVG value={voteUrl} size={220} level="M" />
              ) : (
                <div className="h-[220px] w-[220px] animate-pulse bg-slate-200" />
              )}
            </div>
            <p
              className={`max-w-[14rem] text-center text-sm font-bold ${projection.meta} ${projection.textShadow}`}
            >
              Scan to vote
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function ProjectionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <p className="text-2xl font-bold">Loading projection…</p>
        </main>
      }
    >
      <ProjectionView />
    </Suspense>
  );
}
