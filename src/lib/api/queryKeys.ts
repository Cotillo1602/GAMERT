import type { GameId } from "../../data/games";
import type { TournamentFilter } from "./tournaments";

/** Claves de consulta canónicas (docs/API.md §3). */
export const queryKeys = {
  tournaments: (filter: TournamentFilter = {}) => ["tournaments", filter] as const,
  tournament: (id: string) => ["tournament", id] as const,
  myTournaments: () => ["myTournaments"] as const,
  organizedBy: (userId: string) => ["organizedBy", userId] as const,
  bracket: (tournamentId: string) => ["bracket", tournamentId] as const,
  standings: (tournamentId: string) => ["standings", tournamentId] as const,
  participants: (tournamentId: string) => ["participants", tournamentId] as const,
  ranking: (gameId: GameId) => ["ranking", gameId] as const,
  profile: (id: string) => ["profile", id] as const,
  players: (q: string) => ["players", q] as const,
  notifications: () => ["notifications"] as const,
  settings: () => ["settings"] as const,
  me: () => ["me"] as const,
};
