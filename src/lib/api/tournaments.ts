import type { GameId } from "../../data/games";
import type { Tournament } from "../../data/tournaments";
import { loadState } from "./demo-store";

export interface TournamentFilter {
  gameId?: GameId;
  status?: Tournament["status"];
}

export async function listTournaments(filter: TournamentFilter = {}): Promise<Tournament[]> {
  return loadState().tournaments.filter(
    (t) =>
      (!filter.gameId || t.gameId === filter.gameId) &&
      (!filter.status || t.status === filter.status),
  );
}

export async function getTournament(id: string): Promise<Tournament | undefined> {
  return loadState().tournaments.find((t) => t.id === id);
}

export async function listMyTournaments(userId: string): Promise<Tournament[]> {
  const state = loadState();
  const mine = state.registrations[userId] ?? [];
  return state.tournaments.filter((t) => mine.includes(t.id));
}

export async function listOrganizedBy(userId: string): Promise<Tournament[]> {
  return loadState().tournaments.filter((t) => t.organizerId === userId);
}
