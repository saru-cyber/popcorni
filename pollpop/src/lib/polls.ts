import { getSupabase } from "@/lib/supabase/client";
import { normalizeTheme } from "@/lib/themes";
import type {
  CreatePollInput,
  Poll,
  PollOption,
  Vote,
  VoteCounts,
} from "@/types/poll";

function normalizePoll(row: Record<string, unknown>): Poll {
  return {
    id: row.id as string,
    user_id: (row.user_id as string | null) ?? null,
    title: row.title as string,
    options: row.options as PollOption[],
    theme: normalizeTheme(row.theme),
    max_votes_per_user: (row.max_votes_per_user as number) ?? 5,
    is_closed: Boolean(row.is_closed),
    enable_super_votes: Boolean(row.enable_super_votes),
    manual_votes: (row.manual_votes as Record<string, number>) ?? {},
    custom_mascot_url: (row.custom_mascot_url as string | null) ?? null,
    question_number: Number(row.question_number ?? 1) || 1,
    created_at: row.created_at as string,
  };
}

export async function createPoll(input: CreatePollInput): Promise<Poll> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("polls")
    .insert({
      title: input.title || "Untitled Poll",
      options: input.options,
      max_votes_per_user: input.max_votes_per_user,
      theme: input.theme,
      user_id: null,
      is_closed: false,
      enable_super_votes: false,
      manual_votes: {},
      question_number: 1,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizePoll(data);
}

export async function fetchPoll(pollId: string): Promise<Poll | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizePoll(data);
}

export async function closePoll(pollId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("polls")
    .update({ is_closed: true })
    .eq("id", pollId);

  if (error) throw new Error(error.message);
}

/** Close current question, clear votes, open the next question on the same poll id */
export async function startNextQuestion(
  pollId: string,
  input: CreatePollInput,
  currentQuestionNumber: number,
): Promise<Poll> {
  const supabase = getSupabase();
  const nextNumber = Math.max(1, currentQuestionNumber) + 1;

  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("poll_id", pollId);

  if (deleteError) throw new Error(deleteError.message);

  const { data, error } = await supabase
    .from("polls")
    .update({
      title: input.title || "Untitled Poll",
      options: input.options,
      max_votes_per_user: input.max_votes_per_user,
      theme: input.theme,
      is_closed: false,
      manual_votes: {},
      question_number: nextNumber,
    })
    .eq("id", pollId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizePoll(data);
}

export async function castVote(
  pollId: string,
  optionId: number,
  fingerprint?: string,
): Promise<Vote> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      voter_fingerprint: fingerprint ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Vote;
}

export async function fetchVotes(pollId: string): Promise<Vote[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("poll_id", pollId);

  if (error) throw new Error(error.message);
  return (data ?? []) as Vote[];
}

export function aggregateCounts(
  votes: Vote[],
  manualVotes: Record<string, number> = {},
): VoteCounts {
  const counts: VoteCounts = {};
  for (const vote of votes) {
    counts[vote.option_id] = (counts[vote.option_id] ?? 0) + 1;
  }
  for (const [key, extra] of Object.entries(manualVotes)) {
    const id = Number(key);
    counts[id] = (counts[id] ?? 0) + (extra || 0);
  }
  return counts;
}
