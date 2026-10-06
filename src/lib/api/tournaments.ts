import { tournaments } from "../../data/tournaments";
import { isDemoMode } from "./utils";
import type { Tournament } from "../../data/tournaments";

export async function listTournaments(): Promise<Tournament[]> {
  if (isDemoMode()) return Promise.resolve([...tournaments]);
  return Promise.resolve([...tournaments]);
}

export async function getTournament(id: string): Promise<Tournament | undefined> {
  if (isDemoMode()) return Promise.resolve(tournaments.find((t: Tournament) => t.id === id));
  return Promise.resolve(tournaments.find((t: Tournament) => t.id === id));
}

export async function listMyTournaments(userId: string): Promise<Tournament[]> {
  if (isDemoMode())
    return Promise.resolve(tournaments.filter((t: Tournament) => t.organizerId === userId));
  return Promise.resolve(tournaments.filter((t: Tournament) => t.organizerId === userId));
}
