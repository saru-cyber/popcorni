"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";
import { LiveResultsChart } from "@/components/LiveResultsChart";
import { PopcorniAccountLinks } from "@/components/popcorni/PopcorniAccountLinks";
import {
  chartChrome,
  PopcorniScreen,
} from "@/components/popcorni/PopcorniScreen";
import { usePopcorniSession } from "@/components/popcorni/PopcorniSessionProvider";
import { usePopcorniTheme } from "@/components/popcorni/PopcorniThemeProvider";
import { getAppBaseUrl, getConfiguredAppUrl } from "@/lib/app-url";
import {
  clearActivePollId,
  setActivePollId,
  setSessionPhase,
} from "@/lib/poll-storage";
import { closePoll, setPremiumFx } from "@/lib/polls";
import { appendThemeQuery } from "@/lib/popcorni/screenTheme";
import { useLivePoll } from "@/lib/hooks/useLivePoll";
import { getTheme } from "@/config/themes";

function subscribeNoop() {
  return () => {};
}

function readClientBaseUrl() {
  return getAppBaseUrl();
}

function readServerBaseUrl() {
  return getConfiguredAppUrl() ?? "";
}

type DialogKind = "finishVoting" | "next" | "finish" | null;
type BusyKind = "closing" | "next" | "finish" | null;

export default function AdminPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const router = useRouter();
  const { poll, counts, totalVotes, loading, error, votes, lastBumpedOptionId } =
    useLivePoll(pollId);
  const { isPro, features, isLoading: authLoading } = usePopcorniSession();
  const { theme, surfaces } = usePopcorniTheme();
  const [busy, setBusy] = useState<BusyKind>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const baseUrl = useSyncExternalStore(
    subscribeNoop,
    readClientBaseUrl,
    readServerBaseUrl,
  );

  const themeConfig = getTheme(poll?.theme);
  const chrome = chartChrome(theme);
  const premiumSynced = useRef(false);

  useEffect(() => {
    if (authLoading || !isPro || !poll || poll.enable_super_votes || premiumSynced.current) {
      return;
    }
    premiumSynced.current = true;
    void setPremiumFx(poll.id, true).catch(() => {
      premiumSynced.current = false;
    });
  }, [authLoading, isPro, poll]);

  useEffect(() => {
    document.body.classList.add("admin-shell");
    document.documentElement.dataset.adminTheme = theme.id;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("admin-shell");
      delete document.documentElement.dataset.adminTheme;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [theme.id]);

  const voteUrl = useMemo(
    () =>
      baseUrl
        ? appendThemeQuery(`${baseUrl}/poll/${pollId}`, theme.id, false)
        : "",
    [baseUrl, pollId, theme.id],
  );
  const obsUrl = useMemo(
    () =>
      baseUrl
        ? appendThemeQuery(
            `${baseUrl}/poll/${pollId}/obs`,
            theme.id,
            features.premiumWinnerFx,
          )
        : "",
    [baseUrl, pollId, theme.id, features.premiumWinnerFx],
  );
  const projectionUrl = useMemo(
    () => (baseUrl ? `${baseUrl}/poll/${pollId}/projection` : ""),
    [baseUrl, pollId],
  );

  /** Stage 1: close voting, stay on page so winner FX can play on admin + OBS */
  async function runFinishVoting() {
    setBusy("closing");
    try {
      await closePoll(pollId);
      setDialog(null);
      setBusy(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to finish voting");
      setBusy(null);
      setDialog(null);
    }
  }

  /** Stage 2: leave celebration and compose the next question (same room) */
  async function runNextQuestion() {
    setBusy("next");
    try {
      setActivePollId(pollId);
      setSessionPhase("compose_next");
      router.push(`/poll/${pollId}/next`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to open next question");
      setBusy(null);
      setDialog(null);
    }
  }

  async function runFinishStream() {
    setBusy("finish");
    try {
      if (poll && !poll.is_closed) {
        await closePoll(pollId);
      }
      clearActivePollId();
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to finish stream");
      setBusy(null);
      setDialog(null);
    }
  }

  function requestPrimaryAction() {
    if (poll?.is_closed) {
      setDialog("next");
      return;
    }
    setDialog("finishVoting");
  }

  function requestFinishStream() {
    setDialog("finish");
  }

  const cardStyle = {
    ...surfaces.card,
    borderColor: theme.colors.cardBorder,
  };

  if (loading) {
    return (
      <PopcorniScreen mode="app" source="account" className="h-screen">
        <main className="flex h-full flex-col items-center justify-center gap-4 px-4">
          <PopcorniAccountLinks />
          <p style={surfaces.muted}>Loading poll…</p>
        </main>
      </PopcorniScreen>
    );
  }

  if (error || !poll) {
    return (
      <PopcorniScreen mode="app" source="account" className="h-screen">
        <main className="flex h-full flex-col items-center justify-center gap-4 px-4">
          <PopcorniAccountLinks />
          <p style={surfaces.error}>{error ?? "Poll not found"}</p>
          <button
            type="button"
            onClick={() => {
              clearActivePollId();
              router.push("/");
            }}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={surfaces.button}
          >
            Back to home
          </button>
        </main>
      </PopcorniScreen>
    );
  }

  const questionNumber = poll.question_number ?? 1;
  const isVotingOpen = !poll.is_closed;

  return (
    <PopcorniScreen
      mode="app"
      source="account"
      className="h-screen max-h-screen overflow-hidden"
    >
      <main
        className="h-full max-h-full overflow-hidden"
        data-theme={theme.id}
        data-admin-theme={theme.id}
        data-poll-theme={themeConfig.id}
      >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-3 py-2 sm:px-4 lg:px-5 lg:py-2.5">
        {/* Compact single-row header */}
        <header className="flex shrink-0 items-center gap-2 py-2 sm:gap-3">
          <Link
            href="/"
            className="group flex shrink-0 items-baseline gap-1"
          >
            <span
              className="font-[family-name:var(--font-display)] text-xl font-black tracking-tight transition sm:text-2xl"
              style={surfaces.accent}
            >
              PollPop
            </span>
            <span
              className="hidden text-[10px] font-medium uppercase tracking-widest sm:inline"
              style={surfaces.muted}
            >
              live
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {questionNumber >= 2 ? (
              <span
                className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide"
                style={surfaces.badge}
              >
                Q{questionNumber}
              </span>
            ) : null}
            <span
              className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={surfaces.badge}
            >
              {isVotingOpen ? "Live" : "Closed"}
            </span>
            <h1
              className="min-w-0 truncate font-[family-name:var(--font-display)] text-lg font-extrabold leading-tight sm:text-xl"
              style={surfaces.title}
            >
              {poll.title}
            </h1>
            <span className="hidden shrink-0 text-xs sm:inline" style={surfaces.muted}>
              {totalVotes} votes
            </span>
          </div>

          <PopcorniAccountLinks compact />
          <button
            type="button"
            disabled={busy !== null}
            onClick={requestFinishStream}
            className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-50 sm:px-3 sm:text-xs"
            style={surfaces.buttonSecondary}
          >
            {busy === "finish" ? "…" : "🛑 Finish Stream"}
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] lg:gap-4">
          {/* Left: QR / links / status */}
          <aside
            className="flex min-h-0 shrink-0 flex-row items-center gap-2.5 overflow-hidden rounded-2xl border !p-2.5 lg:flex-col lg:justify-between lg:gap-3 lg:!p-3"
            style={cardStyle}
          >
            <div className="hidden w-full lg:block">
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={surfaces.muted}
              >
                Stream status
              </p>
              <p className="mt-0.5 text-sm font-semibold" style={surfaces.title}>
                {isVotingOpen ? "Voting open" : "Voting closed"}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1">
              <p
                className="hidden text-[10px] font-semibold uppercase tracking-wider lg:block"
                style={surfaces.muted}
              >
                QR for Voters
              </p>
              <div className="rounded-lg bg-white p-1 shadow-sm lg:p-1.5">
                {voteUrl ? (
                  <div className="h-20 w-20 lg:h-32 lg:w-32">
                    <QRCodeSVG value={voteUrl} size={128} level="M" className="h-full w-full" />
                  </div>
                ) : (
                  <div className="h-20 w-20 animate-pulse bg-slate-200 lg:h-32 lg:w-32" />
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:w-full lg:flex-none">
              <CopyButton
                label="📋 Copy Share Link"
                value={voteUrl}
                className="w-full px-2 py-1.5 text-[11px] sm:text-xs lg:px-3 lg:py-2"
                style={surfaces.button}
              />
              <CopyButton
                label="🎥 Copy OBS Link"
                value={obsUrl}
                className="w-full px-2 py-1.5 text-[11px] sm:text-xs lg:px-3 lg:py-2"
                style={surfaces.button}
              />
              <CopyButton
                label="🎥 Copy Projection Link"
                value={projectionUrl}
                className="w-full px-2 py-1.5 text-[11px] sm:text-xs lg:px-3 lg:py-2"
                style={surfaces.buttonSecondary}
              />
            </div>
          </aside>

          {/* Right: Live Results + CTA — no internal scroll */}
          <section className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border !p-3"
              style={cardStyle}
            >
              <h2
                className="mb-2 shrink-0 font-[family-name:var(--font-display)] text-sm font-bold"
                style={surfaces.title}
              >
                📊 Live Results
              </h2>
              <div className="min-h-0 flex-1 overflow-hidden">
                <LiveResultsChart
                  options={poll.options}
                  counts={counts}
                  totalVotes={totalVotes}
                  theme={poll.theme}
                  surface="admin"
                  votesPerVoter={poll.max_votes_per_user}
                  votes={votes}
                  bumpedOptionId={lastBumpedOptionId}
                  isClosed={poll.is_closed}
                  questionNumber={poll.question_number}
                  premiumFx={features.premiumWinnerFx}
                  chrome={chrome}
                />
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <button
                type="button"
                disabled={busy !== null}
                onClick={requestPrimaryAction}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
                style={surfaces.button}
              >
                {busy === "closing"
                  ? "Finishing voting…"
                  : busy === "next"
                    ? "Opening…"
                    : poll.is_closed
                      ? "🚀 Next Question"
                      : "🏁 Finish Voting"}
              </button>
              <p className="mt-1 text-center text-[10px] leading-snug" style={surfaces.muted}>
                {poll.is_closed
                  ? "Winner stays on OBS until Next Question."
                  : features.premiumWinnerFx
                    ? `Popcorni Pro · ${theme.name} · premium winner FX is on.`
                    : `Theme ${theme.name}. Popcorni Pro unlocks premium winner FX.`}
              </p>
            </div>
          </section>
        </div>

        <ConfirmDialog
          open={dialog === "finishVoting"}
          title="Finish Voting?"
          description="Close this question and reveal the winner. Stay on this page to watch the celebration with your stream before starting the next question."
          confirmLabel="🏁 Finish Voting"
          busy={busy === "closing"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runFinishVoting()}
        />

        <ConfirmDialog
          open={dialog === "next"}
          title="Next Question?"
          description="Leave the winner reveal and create the next question in the same room. Share link and OBS URL stay the same."
          confirmLabel="🚀 Next Question"
          busy={busy === "next"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runNextQuestion()}
        />

        <ConfirmDialog
          open={dialog === "finish"}
          title="Finish Stream"
          description="End this stream session? You'll leave this room and create a brand-new poll URL next time."
          confirmLabel="🛑 Finish Stream"
          busy={busy === "finish"}
          onCancel={() => setDialog(null)}
          onConfirm={() => void runFinishStream()}
        />
      </div>
      </main>
    </PopcorniScreen>
  );
}
