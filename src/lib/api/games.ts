import { GAMES } from "../../data/games";
import { isDemoMode } from "./utils";
import type { Game } from "../../data/games";

export type { Game, GameId } from "../../data/games";

export async function listGames(): Promise<Game[]> {
  if (isDemoMode()) {
    return Promise.resolve([...GAMES]);
  }
  // TODO: leer desde tabla `games` (orden por popular/name)
  return Promise.resolve([...GAMES]);
}

export async function getGame(id: string): Promise<Game | undefined> {
  if (isDemoMode()) {
    return Promise.resolve(GAMES.find((g: Game) => g.id === id));
  }
  return Promise.resolve(GAMES.find((g: Game) => g.id === id));
}
