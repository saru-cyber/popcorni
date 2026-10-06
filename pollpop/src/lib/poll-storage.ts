const ACTIVE_POLL_KEY = "active_poll_id";
const SESSION_PHASE_KEY = "session_phase";

export type SessionPhase = "live" | "compose_next";

export function getActivePollId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_POLL_KEY);
}

export function setActivePollId(pollId: string): void {
  localStorage.setItem(ACTIVE_POLL_KEY, pollId);
}

export function clearActivePollId(): void {
  localStorage.removeItem(ACTIVE_POLL_KEY);
  localStorage.removeItem(SESSION_PHASE_KEY);
}

export function getSessionPhase(): SessionPhase | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_PHASE_KEY);
  if (raw === "live" || raw === "compose_next") return raw;
  return null;
}

export function setSessionPhase(phase: SessionPhase): void {
  localStorage.setItem(SESSION_PHASE_KEY, phase);
}

function voteKey(pollId: string, questionNumber: number): string {
  return `voted_count_${pollId}_q${questionNumber}`;
}

export function getVotedCount(pollId: string, questionNumber = 1): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(voteKey(pollId, questionNumber));
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function setVotedCount(
  pollId: string,
  count: number,
  questionNumber = 1,
): void {
  localStorage.setItem(voteKey(pollId, questionNumber), String(count));
}

export function incrementVotedCount(
  pollId: string,
  questionNumber = 1,
): number {
  const next = getVotedCount(pollId, questionNumber) + 1;
  setVotedCount(pollId, next, questionNumber);
  return next;
}
