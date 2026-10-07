import { CURRENT_USER_ID } from "../../data/players";
import { scheduleRounds, seedRosterFor } from "../bracket";
import { commitState, createNotification, eloRecord, loadState } from "./demo-store";

/**
 * Siembra por ELO y publica el cuadro de los torneos en los que estoy
 * inscripto cuando llega su hora de inicio (asume el rol que tenía el
 * auto-start del `AppContext`). Se invoca al montar la app y con cada
 * `commitState`; no commitea nada si no hay un torneo por arrancar.
 */
export function autoStartDue(): void {
  const s = loadState();
  if (!s.authenticated) return;
  const mine = s.registrations[CURRENT_USER_ID] ?? [];
  const now = Date.now();
  const hasDue = s.tournaments.some((t) => {
    if (t.status !== "upcoming" || s.brackets[t.id] || !mine.includes(t.id)) return false;
    const at = new Date(`${t.date}T${t.time}:00`).getTime();
    return !Number.isNaN(at) && at <= now;
  });
  if (!hasDue) return;

  commitState((next) => {
    const brackets = { ...next.brackets };
    const nextNow = Date.now();
    let notifications = next.notifications;
    let changed = false;

    const tournaments = next.tournaments.map((t) => {
      if (t.status !== "upcoming" || brackets[t.id]) return t;
      const mine2 = next.registrations[CURRENT_USER_ID] ?? [];
      if (!mine2.includes(t.id)) return t;
      const at = new Date(`${t.date}T${t.time}:00`).getTime();
      if (Number.isNaN(at) || at > nextNow) return t;

      const seeds = seedRosterFor(t, next.registrations, (p, g) => eloRecord(next, p, g));
      if (seeds.length < 2) return t;

      brackets[t.id] = scheduleRounds(t.id, seeds, new Date(at).toString());
      notifications = [
        createNotification({
          title: `${t.name} arrancó`,
          body: `La app generó el cuadro: ${seeds.length} participantes sembrados por ELO.`,
          kind: "torneo",
          gameId: t.gameId,
        }),
        ...notifications,
      ];
      changed = true;
      return {
        ...t,
        status: "live" as const,
        phase: brackets[t.id][0]?.roundLabel ?? "RONDA 1",
      };
    });

    if (!changed) return next;
    return { ...next, tournaments, brackets, notifications };
  });
}
