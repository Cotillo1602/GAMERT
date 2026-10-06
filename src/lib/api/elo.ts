import { isDemoMode } from "./utils";

export interface EloRow {
  playerId: string;
  gameId: string;
  rating: number;
}

export async function rankingFor(_gameId: string): Promise<EloRow[]> {
  if (isDemoMode()) return Promise.resolve([]);
  return Promise.resolve([]);
}

export async function eloOf(_playerId: string, _gameId: string): Promise<number> {
  if (isDemoMode()) return Promise.resolve(1500);
  return Promise.resolve(1500);
}
