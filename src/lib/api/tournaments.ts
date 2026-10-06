import type { GameId } from "../../data/games";
import type { Tournament } from "../../data/tournaments";
import { todayISO } from "../../data/tournaments";
import { CURRENT_USER_ID } from "../../data/players";
import { commitState, createNotification, loadState } from "./demo-store";
import { isDemoMode } from "./utils";

export type { Tournament, Format, Prize, Rules, Modality } from "../../data/tournaments";
export { rulesText, FORMAT_LABELS, todayISO } from "../../data/tournaments";

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

export interface CreateTournamentInput {
  name: string;
  gameId: GameId;
  format: Tournament["format"];
  modality: Tournament["modality"];
  date: string;
  time: string;
  slots: number;
  prize: Tournament["prize"];
  rules: Tournament["rules"];
}

export async function createTournament(input: CreateTournamentInput): Promise<string> {
  if (!isDemoMode()) throw new Error("createTournament: fuera de modo demo");
  const id = `t-${Date.now().toString(36)}`;
  const t: Tournament = {
    id,
    name: input.name.trim().toUpperCase(),
    gameId: input.gameId,
    organizerId: CURRENT_USER_ID,
    publisherTier: "comunidad",
    modality: input.modality,
    format: input.format,
    date: input.date,
    time: input.time,
    timezone: "GMT-3",
    enrolled: 1,
    slots: input.slots,
    prize: input.prize,
    rules: input.rules,
    status: input.date > todayISO() ? "upcoming" : "live",
  };
  commitState((s) => ({
    ...s,
    tournaments: [t, ...s.tournaments],
    registrations: {
      ...s.registrations,
      [CURRENT_USER_ID]: [id, ...(s.registrations[CURRENT_USER_ID] ?? [])],
    },
    notifications: [
      createNotification({
        title: `Torneo publicado: ${t.name}`,
        body: "La app se encarga de la siembra, el cuadro, los horarios y los resultados.",
        kind: "torneo",
        gameId: t.gameId,
      }),
      ...s.notifications,
    ],
  }));
  return id;
}

export async function cancelTournament(id: string): Promise<void> {
  if (!isDemoMode()) return;
  commitState((s) => {
    const brackets = { ...s.brackets };
    delete brackets[id];
    return {
      ...s,
      tournaments: s.tournaments.map((x) =>
        x.id === id ? { ...x, status: "finished", enrolled: 0 } : x,
      ),
      brackets,
      notifications: [
        createNotification({
          title: "Torneo cancelado",
          body: "Los inscritos fueron notificados.",
          kind: "sistema",
        }),
        ...s.notifications,
      ],
    };
  });
}
