"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PollCreateForm } from "@/components/PollCreateForm";
import { usePopcorniSession } from "@/components/popcorni/PopcorniSessionProvider";
import { createPoll } from "@/lib/polls";
import {
  getActivePollId,
  getSessionPhase,
  setActivePollId,
  setSessionPhase,
  type SessionPhase,
} from "@/lib/poll-storage";

type SessionSnapshot = {
  activePollId: string | null;
  phase: SessionPhase | null;
};

const SERVER_SNAPSHOT: SessionSnapshot = { activePollId: null, phase: null };

let cachedClientSnapshot: SessionSnapshot = SERVER_SNAPSHOT;

function subscribeNoop() {
  return () => {};
}

function readSession(): SessionSnapshot {
  const activePollId = getActivePollId();
  const phase = getSessionPhase();
  if (
    cachedClientSnapshot.activePollId === activePollId &&
    cachedClientSnapshot.phase === phase
  ) {
    return cachedClientSnapshot;
  }
  cachedClientSnapshot = { activePollId, phase };
  return cachedClientSnapshot;
}

function getServerSnapshot(): SessionSnapshot {
  return SERVER_SNAPSHOT;
}

export default function HomePage() {
  const router = useRouter();
  const { user, isPro, isLoading: authLoading, features } = usePopcorniSession();
  const session = useSyncExternalStore(
    subscribeNoop,
    readSession,
    getServerSnapshot,
  );

  useEffect(() => {
    if (authLoading || features.multipleActivePolls) return;
    if (!session.activePollId) return;
    if (session.phase === "compose_next") {
      router.replace(`/poll/${session.activePollId}/next`);
      return;
    }
    router.replace(`/poll/${session.activePollId}/admin`);
  }, [
    authLoading,
    features.multipleActivePolls,
    session.activePollId,
    session.phase,
    router,
  ]);

  if (authLoading && session.activePollId && !isPro) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
        <p className="text-slate-400">Checking your Popcorni account…</p>
      </main>
    );
  }

  if (session.activePollId && !features.multipleActivePolls) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
        <p className="text-slate-400">Opening your active poll…</p>
      </main>
    );
  }

  return (
    <PollCreateForm
      questionNumber={1}
      headerTitle="Create a live poll in 5 seconds"
      submitLabel="🚀 Share & Create Poll"
      banner={
        features.multipleActivePolls && session.activePollId ? (
          <p>
            Pro is active.{" "}
            <a
              href={`/poll/${session.activePollId}/admin`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              Open your live poll
            </a>{" "}
            or create another one.
          </p>
        ) : null
      }
      onSubmitPoll={async (values) => {
        const poll = await createPoll(values, {
          userId: user?.id ?? null,
          premiumFx: features.premiumWinnerFx,
        });
        setActivePollId(poll.id);
        setSessionPhase("live");
        router.push(`/poll/${poll.id}/admin`);
      }}
    />
  );
}
