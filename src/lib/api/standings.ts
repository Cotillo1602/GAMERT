import { standingsOf as buildStandings } from "../../lib/bracket";
import { bracketOf } from "./matches";
import type { Match, StandingRow } from "../../lib/bracket";

export async function standingsOfMatches(matches: Match[]): Promise<StandingRow[]> {
  return buildStandings(matches);
}

export async function standingsOf(tournamentId: string): Promise<StandingRow[]> {
  return buildStandings(await bracketOf(tournamentId));
}
