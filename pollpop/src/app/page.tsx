"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PollCreateForm } from "@/components/PollCreateForm";
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
  const session = useSyncExternalStore(
    subscribeNoop,
    readSession,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!session.activePollId) return;
    if (session.phase === "compose_next") {
      router.replace(`/poll/${session.activePollId}/next`);
      return;
    }
    router.replace(`/poll/${session.activePollId}/admin`);
  }, [session.activePollId, session.phase, router]);

  if (session.activePollId) {
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
      onSubmitPoll={async (values) => {
        const poll = await createPoll(values);
        setActivePollId(poll.id);
        setSessionPhase("live");
        router.push(`/poll/${poll.id}/admin`);
      }}
    />
  );
}
