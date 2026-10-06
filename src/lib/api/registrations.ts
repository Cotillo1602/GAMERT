import { CURRENT_USER_ID } from "../../data/players";
import type { Tournament } from "../../data/tournaments";
import {
  commitState,
  createNotification,
  eloRecord,
  loadState,
  type DemoState,
} from "./demo-store";
import { isDemoMode } from "./utils";

export type JoinResult = { ok: boolean; error?: string };

export async function isJoined(tournamentId: string, userId: string): Promise<boolean> {
  return (loadState().registrations[userId] ?? []).includes(tournamentId);
}

export async function participants(tournamentId: string): Promise<string[]> {
  const regs = loadState().registrations;
  return Object.entries(regs)
    .filter(([, tids]) => tids.includes(tournamentId))
    .map(([userId]) => userId);
}

/** Validaciones en el mismo orden que la RPC `join_tournament`. */
function joinError(state: DemoState, tournament: Tournament, userId: string): string | undefined {
  if (tournament.status !== "upcoming") return "NOT_OPEN";
  if (tournament.organizerId === userId) return "ORGANIZER_CANNOT_JOIN";
  if ((state.registrations[userId] ?? []).includes(tournament.id)) return "ALREADY_JOINED";
  const max = Math.min(tournament.rules.maxParticipants || tournament.slots, tournament.slots);
  if (tournament.enrolled >= max) return "SLOT_FULL";
  if (eloRecord(state, userId, tournament.gameId).rating < tournament.rules.minElo)
    return "ELO_TOO_LOW";
  return undefined;
}

export async function joinTournament(
  tournamentId: string,
  userId: string = CURRENT_USER_ID,
): Promise<JoinResult> {
  if (!isDemoMode()) return { ok: false, error: "NOT_IMPLEMENTED" };
  const state = loadState();
  const tournament = state.tournaments.find((t) => t.id === tournamentId);
  if (!tournament) return { ok: false, error: "NOT_FOUND" };
  const code = joinError(state, tournament, userId);
  if (code) return { ok: false, error: code };

  commitState((s) => ({
    ...s,
    registrations: {
      ...s.registrations,
      [userId]: [...(s.registrations[userId] ?? []), tournamentId],
    },
    tournaments: s.tournaments.map((t) =>
      t.id === tournamentId ? { ...t, enrolled: t.enrolled + 1 } : t,
    ),
    notifications: [
      createNotification({
        title: `Inscripción confirmada en ${tournament.name}`,
        body: "La app te siembra por ELO cuando llegue el inicio.",
        kind: "torneo",
        gameId: tournament.gameId,
      }),
      ...s.notifications,
    ],
  }));
  return { ok: true };
}

export async function leaveTournament(
  tournamentId: string,
  userId: string = CURRENT_USER_ID,
): Promise<JoinResult> {
  if (!isDemoMode()) return { ok: false, error: "NOT_IMPLEMENTED" };
  const state = loadState();
  const tournament = state.tournaments.find((t) => t.id === tournamentId);
  if (!tournament) return { ok: false, error: "NOT_FOUND" };
  if (state.brackets[tournamentId]) return { ok: false, error: "BRACKET_STARTED" };
  if (!(state.registrations[userId] ?? []).includes(tournamentId)) return { ok: true };

  commitState((s) => ({
    ...s,
    registrations: {
      ...s.registrations,
      [userId]: (s.registrations[userId] ?? []).filter((id) => id !== tournamentId),
    },
    tournaments: s.tournaments.map((t) =>
      t.id === tournamentId ? { ...t, enrolled: Math.max(0, t.enrolled - 1) } : t,
    ),
  }));
  return { ok: true };
}
