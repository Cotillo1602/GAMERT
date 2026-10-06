import { isDemoMode } from "./utils";
import type { Match } from "../../lib/bracket";

export async function bracketOf(_tournamentId: string): Promise<Match[]> {
  if (isDemoMode()) return Promise.resolve([]);
  return Promise.resolve([]);
}

export async function nextMatchFor(
  _matches: Match[],
  _playerId: string,
): Promise<Match | undefined> {
  if (isDemoMode()) return Promise.resolve(undefined);
  return Promise.resolve(undefined);
}
