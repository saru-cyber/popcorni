"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PollCreateForm } from "@/components/PollCreateForm";
import {
  getSessionPhase,
  setActivePollId,
  setSessionPhase,
} from "@/lib/poll-storage";
import { fetchPoll, startNextQuestion } from "@/lib/polls";

export default function NextQuestionPage() {
  const params = useParams<{ id: string }>();
  const pollId = params.id;
  const router = useRouter();
  const [nextQuestionNumber, setNextQuestionNumber] = useState(2);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const phase = getSessionPhase();
        const poll = await fetchPoll(pollId);
        if (!poll) {
          if (!cancelled) setBootError("Poll not found");
          return;
        }
        if (phase !== "compose_next" && !poll.is_closed) {
          router.replace(`/poll/${pollId}/admin`);
          return;
        }
        if (!cancelled) {
          setNextQuestionNumber(Math.max(1, poll.question_number) + 1);
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : "Failed to load poll");
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [pollId, router]);

  if (bootError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
        <p className="text-rose-300">{bootError}</p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
        <p className="text-slate-400">Preparing next question…</p>
      </main>
    );
  }

  return (
    <PollCreateForm
      questionNumber={nextQuestionNumber}
      headerTitle={`Create Question #${nextQuestionNumber}`}
      submitLabel={`🚀 Create Q${nextQuestionNumber}`}
      onSubmitPoll={async (values) => {
        const current = await fetchPoll(pollId);
        if (!current) throw new Error("Poll not found");
        const poll = await startNextQuestion(
          pollId,
          values,
          current.question_number,
        );
        setActivePollId(poll.id);
        setSessionPhase("live");
        router.push(`/poll/${poll.id}/admin`);
      }}
    />
  );
}
