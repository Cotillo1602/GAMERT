import { players, type Player } from "../../data/players";
import { isDemoMode } from "./utils";

export async function getProfile(id: string): Promise<Player | undefined> {
  if (isDemoMode()) return Promise.resolve(players.find((p: Player) => p.id === id));
  return Promise.resolve(players.find((p: Player) => p.id === id));
}

export async function listPlayers(): Promise<Player[]> {
  if (isDemoMode()) return Promise.resolve([...players]);
  return Promise.resolve([...players]);
}

export async function searchPlayers(query: string): Promise<Player[]> {
  const term = query.trim().toLowerCase();
  const list = [...players];
  if (!term) return list;
  return list.filter(
    (p) => p.name.toLowerCase().includes(term) || p.handle.toLowerCase().includes(term),
  );
}
