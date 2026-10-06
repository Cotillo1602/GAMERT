import { CURRENT_USER_ID, players } from "../../data/players";
import { eloRecord, loadState } from "./demo-store";

export interface EloRow {
  playerId: string;
  gameId: string;
  rating: number;
}

export async function rankingFor(gameId: string): Promise<EloRow[]> {
  const state = loadState();
  const rows = players
    .filter((p) => p.id === CURRENT_USER_ID || p.elo[gameId as keyof typeof p.elo] !== undefined)
    .map((p) => ({ playerId: p.id, elo: eloRecord(state, p.id, gameId) }))
    .sort((a, b) => b.elo.rating - a.elo.rating || b.elo.wins - a.elo.wins);
  return rows.map((r) => ({ playerId: r.playerId, gameId, rating: r.elo.rating }));
}

export async function eloOf(playerId: string, gameId: string): Promise<number> {
  return eloRecord(loadState(), playerId, gameId).rating;
}
