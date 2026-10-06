import { CURRENT_USER_ID, players } from "../../data/players";
import type { EloRecord } from "../elo";
import { eloRecord, loadState } from "./demo-store";

export interface RankingRow {
  playerId: string;
  elo: EloRecord;
}

export async function rankingFor(gameId: string): Promise<RankingRow[]> {
  const state = loadState();
  return players
    .filter((p) => p.id === CURRENT_USER_ID || p.elo[gameId as keyof typeof p.elo] !== undefined)
    .map((p) => ({ playerId: p.id, elo: eloRecord(state, p.id, gameId) }))
    .sort((a, b) => b.elo.rating - a.elo.rating || b.elo.wins - a.elo.wins);
}

export async function eloOf(playerId: string, gameId: string): Promise<EloRecord> {
  return eloRecord(loadState(), playerId, gameId);
}
