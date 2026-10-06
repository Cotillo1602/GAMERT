import { nextMatchFor as findNextMatch, type Match } from "../../lib/bracket";
import { loadState } from "./demo-store";

export async function bracketOf(tournamentId: string): Promise<Match[]> {
  return [...(loadState().brackets[tournamentId] ?? [])].sort((a, b) => a.slot - b.slot);
}

export async function nextMatchFor(matches: Match[], playerId: string): Promise<Match | undefined> {
  return findNextMatch(matches, playerId);
}
