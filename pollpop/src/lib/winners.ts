import { getOptionIcon } from "@/config/themes";
import type { PollOption, VoteCounts } from "@/types/poll";

export type WinnerKind = "single" | "draw" | "all" | "no_votes";

export type TopWinner = {
  option: PollOption;
  votes: number;
  index: number;
  icon: string | null;
};

export type WinnerResult = {
  kind: WinnerKind;
  maxVotes: number;
  /** Options tied for first (all options when no_votes) */
  topOptions: TopWinner[];
  headline: string;
  subline: string;
};

/**
 * Resolve first-place ties for winner celebration.
 * Never picks only the first array item when votes are equal.
 */
export function resolveWinners(
  options: PollOption[],
  counts: VoteCounts,
  theme: unknown,
  showAvatar: boolean,
): WinnerResult | null {
  if (!options.length) return null;

  const tallies = options.map((option, index) => ({
    option,
    index,
    votes: counts[option.id] ?? 0,
  }));

  const maxVotes = Math.max(0, ...tallies.map((t) => t.votes));
  const totalVotes = tallies.reduce((sum, t) => sum + t.votes, 0);

  const toTop = (list: typeof tallies): TopWinner[] =>
    list.map(({ option, index, votes }) => ({
      option,
      votes,
      index,
      icon: showAvatar ? getOptionIcon(theme, index) : null,
    }));

  // No votes: safe fallback — celebrate everyone lightly
  if (totalVotes === 0 || maxVotes === 0) {
    return {
      kind: "no_votes",
      maxVotes: 0,
      topOptions: toTop(tallies),
      headline: "NO VOTES YET",
      subline: "👑 RESULT",
    };
  }

  const tied = tallies.filter((t) => t.votes === maxVotes);
  const topOptions = toTop(tied);

  if (tied.length === 1) {
    return {
      kind: "single",
      maxVotes,
      topOptions,
      headline: "WINNER!",
      subline: "👑 RESULT",
    };
  }

  if (tied.length === options.length) {
    return {
      kind: "all",
      maxVotes,
      topOptions,
      headline: "ALL WINNERS!",
      subline: "👑 RESULT",
    };
  }

  return {
    kind: "draw",
    maxVotes,
    topOptions,
    headline: "DRAW / MULTI WINNER!",
    subline: "👑 RESULT",
  };
}

export function isWinningOption(
  result: WinnerResult | null,
  optionId: number,
): boolean {
  if (!result) return false;
  if (result.kind === "no_votes") return true;
  return result.topOptions.some((t) => t.option.id === optionId);
}
