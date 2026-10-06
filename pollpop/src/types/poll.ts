/** Poll option stored in polls.options JSONB */
export type PollOption = {
  id: number;
  text: string;
};

export type PollTheme = "animal_race" | "dark" | "light" | "game" | "party";

export type ThemeTier = "free" | "pro";

export type ThemeDefinition = {
  value: PollTheme;
  label: string;
  tier: ThemeTier;
  /** Pro themes free users can still try */
  freeTrialAllowed?: boolean;
};

/** 1 | 3 | 5 | 10 | 12 */
export type MaxVotesPerUser = 1 | 3 | 5 | 10 | 12;

export const MAX_VOTES_OPTIONS: { value: MaxVotesPerUser; label: string }[] = [
  { value: 1, label: "1 Vote" },
  { value: 3, label: "3 Votes" },
  { value: 5, label: "5 Votes (Default)" },
  { value: 10, label: "10 Votes" },
  { value: 12, label: "12 Votes" },
];

/** Theme catalogs: import from `@/config/themes` (THEMES, THEME_OPTIONS, …). */

export type Poll = {
  id: string;
  user_id: string | null;
  title: string;
  options: PollOption[];
  theme: PollTheme;
  max_votes_per_user: number;
  is_closed: boolean;
  enable_super_votes: boolean;
  manual_votes: Record<string, number>;
  custom_mascot_url: string | null;
  question_number: number;
  created_at: string;
};

export type Vote = {
  id: string;
  poll_id: string;
  option_id: number;
  voter_fingerprint: string | null;
  created_at: string;
};

export type PaidVote = {
  id: string;
  poll_id: string;
  option_id: number;
  vote_count: number;
  amount_cents: number;
  supporter_name: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

export type CreatePollInput = {
  title: string;
  options: PollOption[];
  max_votes_per_user: MaxVotesPerUser;
  theme: PollTheme;
};

/** Aggregated counts keyed by option id */
export type VoteCounts = Record<number, number>;
