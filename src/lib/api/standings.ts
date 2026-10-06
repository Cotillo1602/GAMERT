import { standingsOf } from "../../lib/bracket";
import { isDemoMode } from "./utils";
import type { Match, StandingRow } from "../../lib/bracket";

export async function standingsOfMatches(matches: Match[]): Promise<StandingRow[]> {
  if (isDemoMode()) return Promise.resolve(standingsOf(matches));
  return Promise.resolve(standingsOf(matches));
}
