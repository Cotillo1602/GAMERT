/* ============================================================
   Motor de cuadro (bracket) — eliminación simple gestionado por la app

   El organizador define reglas y premio; la app se encarga de todo
   lo demás: siembra, emparejamientos, rondas, horarios, reporte de
   resultados, confirmación, disputas y avance de ganadores.
   ============================================================ */

import { players } from "../data/players";
import type { EloRecord } from "./elo";
import type { GameId } from "../data/games";
import type { Tournament } from "../data/tournaments";

export type BracketSize = 2 | 4 | 8 | 16 | 32 | 64;

export type MatchStatus = "pending" | "ready" | "live" | "reported" | "confirmed" | "disputed";

export interface Match {
  id: string;
  tournamentId: string;
  /** posición global del cuadro (índice único y monotónico) */
  slot: number;
  round: number;
  roundLabel: string;
  a: string | null;
  b: string | null;
  /** ELO congelado al emparejamiento, para auditar el cálculo */
  eloSnapshot?: Record<string, number>;
  scoreA: number | null;
  scoreB: number | null;
  status: MatchStatus;
  /** id del partido donde avanza el ganador */
  winnerTo: string | null;
  winnerSlot: "a" | "b" | null;
  /** quién reportó el resultado; null = pendiente */
  reportedBy: string | null;
  /** el rival tiene que confirmar: protege contra el auto-reporte */
  needsConfirmation: boolean;
  /** impugnación abierta: el ELO queda congelado */
  disputed: boolean;
  scheduledAt: string | null;
  startsAt: string;
  reportReason?: string;
}

export interface Round {
  index: number;
  label: string;
  matches: Match[];
}

/** Siguiente potencia de dos ≥ n, acotada a 64 participantes. */
export function bracketSizeFor(n: number): BracketSize {
  const target = Math.max(2, n);
  for (const size of [2, 4, 8, 16, 32, 64] as const) {
    if (size >= target) return size;
  }
  return 64;
}

/** Un cuadro completo de tamaño S tiene S-1 partidos; de ahí se deduce S. */
export function bracketSizeOf(matches: Match[]): number {
  return Math.max(2, Math.log2(matches.length + 1));
}

/**
 * El cuadro se guarda en orden breadth-first: todas las partidas de la
 * primera ronda, después todas las de la segunda, etc.
 */
export function roundBounds(round: number, size: number): { start: number; count: number } {
  return { start: size - size / 2 ** round, count: size / 2 ** (round + 1) };
}

export function roundLabel(round: number, size: number): string {
  const last = Math.log2(size) - 1;
  if (round === last) return "FINAL";
  if (round === last - 1) return "SEMIFINAL";
  if (round === last - 2) return "CUARTOS DE FINAL";
  return `RONDA ${round + 1}`;
}

/**
 * Orden de siembra estándar: 1 vs N, 2 vs N-1, 3 vs N-2…
 *
 * size=4 -> 1,4,2,3
 * size=8 -> 1,8,4,5,2,7,3,6
 */
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const n = order.length * 2 + 1;
    const next: number[] = [];
    for (const s of order) next.push(s, n - s);
    order = next;
  }
  return order;
}

/**
 * Genera el cuadro completo a partir de los participantes ya sembrados.
 * `seeds` viene ordenado por rating descendente (el mejor es el seed 1).
 * Los huecos quedan como null (bye) y avanzan automáticamente.
 */
export function generateBracket(tournamentId: string, seeds: string[], startISO: string): Match[] {
  const size = bracketSizeFor(seeds.length);
  const totalRounds = Math.log2(size);
  const order = seedOrder(size);
  const matches: Match[] = [];

  const firstRoundMatches = size / 2;
  for (let i = 0; i < firstRoundMatches; i++) {
    const a = seeds[order[i * 2] - 1] ?? null;
    const b = seeds[order[i * 2 + 1] - 1] ?? null;
    matches.push(makeMatch(tournamentId, matches.length, 0, roundLabel(0, size), a, b, startISO));
  }

  for (let r = 1; r < totalRounds; r++) {
    const count = firstRoundMatches / 2 ** r;
    for (let i = 0; i < count; i++) {
      matches.push(
        makeMatch(tournamentId, matches.length, r, roundLabel(r, size), null, null, startISO),
      );
    }
  }

  // enlaces de avance hacia la ronda siguiente
  for (const m of matches) {
    if (m.round === totalRounds - 1) {
      m.winnerTo = null;
      m.winnerSlot = null;
      continue;
    }
    const here = roundBounds(m.round, size).start;
    const index = m.slot - here;
    const nextSlot = roundBounds(m.round + 1, size).start + Math.floor(index / 2);
    m.winnerTo = `${tournamentId}:m${nextSlot}`;
    m.winnerSlot = index % 2 === 0 ? "a" : "b";
  }

  return resolveByes(matches);
}

/**
 * Un bye no es una partida: el único presente avanza solo.
 * Sólo aplican a la primera ronda: en rondas posteriores tener un solo
 * participante significa que el otro cruce aún no se jugó.
 * Se recorre en cascada para que los byes de rondas posteriores también fluyan.
 */
export function resolveByes(matches: Match[]): Match[] {
  let current = matches;
  for (let pass = 0; pass < 8; pass++) {
    const byes: string[] = [];
    const next = current.map((m) => {
      const exactlyOne = (m.a !== null) !== (m.b !== null);
      if (m.round !== 0 || !exactlyOne || m.status === "confirmed") return m;
      byes.push(m.id);
      return { ...m, status: "confirmed" as const, needsConfirmation: false };
    });
    current = next;
    for (const id of byes) current = advanceWinner(current, id);
    if (byes.length === 0) break;
  }
  return current;
}

function makeMatch(
  tournamentId: string,
  slot: number,
  round: number,
  label: string,
  a: string | null,
  b: string | null,
  startISO: string,
): Match {
  return {
    id: `${tournamentId}:m${slot}`,
    tournamentId,
    slot,
    round,
    roundLabel: label,
    a,
    b,
    scoreA: null,
    scoreB: null,
    status: a && b ? "ready" : "pending",
    winnerTo: null,
    winnerSlot: null,
    reportedBy: null,
    needsConfirmation: false,
    disputed: false,
    scheduledAt: startISO,
    startsAt: startISO,
  };
}

/** ¿Es un bye (un solo participante en el cruce)? */
export function isBye(m: Match): boolean {
  return (m.a !== null) !== (m.b !== null);
}

/** El match con mayor slot es siempre la final. */
export function finalOf(matches: Match[]): Match | undefined {
  return matches.reduce<Match | undefined>(
    (acc, m) => (!acc || m.slot > acc.slot ? m : acc),
    undefined,
  );
}

/** Avanza al ganador de un partido confirmado al siguiente. */
export function advanceWinner(matches: Match[], matchId: string): Match[] {
  const src = matches.find((m) => m.id === matchId);
  if (!src || !src.winnerTo) return matches;

  const hasA = src.a !== null;
  const hasB = src.b !== null;

  // bye: el único presente avanza sin necesidad de marcador
  if (hasA !== hasB) return placeWinner(matches, src, hasA ? src.a : src.b);

  if (src.scoreA === null || src.scoreB === null || src.scoreA === src.scoreB) return matches;
  return placeWinner(matches, src, src.scoreA > src.scoreB ? src.a : src.b);
}

function placeWinner(matches: Match[], src: Match, winner: string | null): Match[] {
  return matches.map((m) => {
    if (m.id !== src.winnerTo) return m;
    const key: "a" | "b" = src.winnerSlot === "a" ? "a" : "b";
    const updated: Match = { ...m, [key]: winner };
    updated.status = updated.a && updated.b ? "ready" : "pending";
    return updated;
  });
}

/** Marca un partido como confirmado y propaga el ganador (con byes en cascada). */
export function settleMatch(matches: Match[], matchId: string): Match[] {
  const confirmed = matches.map((m) =>
    m.id === matchId
      ? { ...m, status: "confirmed" as const, needsConfirmation: false, disputed: false }
      : m,
  );
  return resolveByes(advanceWinner(confirmed, matchId));
}

/** Rondas agrupadas para renderizar el cuadro. */
export function toRounds(matches: Match[]): Round[] {
  const map = new Map<number, Match[]>();
  for (const m of matches) {
    const list = map.get(m.round) ?? [];
    list.push(m);
    map.set(m.round, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, list]) => ({
      index,
      label: list[0]?.roundLabel ?? `RONDA ${index + 1}`,
      matches: [...list].sort((x, y) => x.slot - y.slot),
    }));
}

/** Siguiente partida jugable de un jugador. */
export function nextMatchFor(matches: Match[], playerId: string): Match | undefined {
  return matches.find(
    (m) => (m.a === playerId || m.b === playerId) && (m.status === "ready" || m.status === "live"),
  );
}

/** ¿Puede reportar este jugador? Solo los dos participantes y una sola vez. */
export function canReport(m: Match, playerId: string): boolean {
  return (
    (m.a === playerId || m.b === playerId) &&
    !isBye(m) &&
    m.status !== "confirmed" &&
    m.scoreA === null
  );
}

/** ¿Terminó el torneo? La final está confirmada. */
export function tournamentFinished(matches: Match[]): boolean {
  const final = finalOf(matches);
  return !!final && !isBye(final) && final.status === "confirmed";
}

export function championOf(matches: Match[]): string | null {
  const final = finalOf(matches);
  if (!final || !final.a || !final.b || final.scoreA === null || final.scoreB === null) return null;
  return final.scoreA > final.scoreB ? final.a : final.b;
}

export function runnerUpOf(matches: Match[]): string | null {
  const final = finalOf(matches);
  if (!final || !final.a || !final.b || final.scoreA === null || final.scoreB === null) return null;
  return final.scoreA > final.scoreB ? final.b : final.a;
}

/** Tercer puesto: el que perdió en la última ronda previa a la final. */
/**
 * Tercer puesto: el perdedor de la semifinal por la que avanzó el campeón.
 * En un cuadro de 2 no hay semifinal, así que no hay tercer puesto.
 */
export function thirdPlaceOf(matches: Match[]): string | null {
  const final = finalOf(matches);
  if (!final) return null;
  const champion = championOf(matches);
  if (!champion) return null;

  const semi = matches.find(
    (m) =>
      m.winnerTo === final.id &&
      m.scoreA !== null &&
      m.scoreB !== null &&
      m.scoreA !== m.scoreB &&
      (m.scoreA > m.scoreB ? m.a : m.b) === champion,
  );
  if (!semi || semi.scoreA === null || semi.scoreB === null) return null;
  return semi.scoreA > semi.scoreB ? semi.b : semi.a;
}

/** Reparto del premio por posición: [1º, 2º, 3º]. */
export function podiumOf(matches: Match[]): [string | null, string | null, string | null] {
  return [championOf(matches), runnerUpOf(matches), thirdPlaceOf(matches)];
}

export interface StandingRow {
  playerId: string;
  played: number;
  wins: number;
  losses: number;
  /** diferencia de puntos a favor */
  points: number;
}

/**
 * Tabla del torneo: la app la calcula sola con los resultados confirmados,
 * sin intervención del organizador.
 */
export function standingsOf(matches: Match[]): StandingRow[] {
  const map = new Map<string, StandingRow>();
  const row = (id: string) => {
    const r = map.get(id) ?? { playerId: id, played: 0, wins: 0, losses: 0, points: 0 };
    map.set(id, r);
    return r;
  };

  for (const m of matches) {
    if (
      isBye(m) ||
      !m.a ||
      !m.b ||
      m.scoreA === null ||
      m.scoreB === null ||
      m.status !== "confirmed"
    )
      continue;
    const ra = row(m.a);
    const rb = row(m.b);
    ra.played += 1;
    rb.played += 1;
    ra.points += m.scoreA - m.scoreB;
    rb.points += m.scoreB - m.scoreA;
    if (m.scoreA > m.scoreB) {
      ra.wins += 1;
      rb.losses += 1;
    } else {
      rb.wins += 1;
      ra.losses += 1;
    }
  }

  return [...map.values()].sort(
    (x, y) => y.wins - x.wins || y.points - x.points || y.played - x.played,
  );
}

/**
 * Reparte los horarios: 30 minutos por partido y 90 entre rondas.
 * Así el organizador no tiene que definir nada de esto.
 */
export function scheduleRounds(tournamentId: string, seeds: string[], startISO: string): Match[] {
  const base = new Date(startISO);
  const baseMs = Number.isNaN(base.getTime()) ? Date.now() : base.getTime();
  const size = bracketSizeFor(seeds.length);

  return generateBracket(tournamentId, seeds, startISO).map((m) => {
    const indexInRound = m.slot - roundBounds(m.round, size).start;
    const start = new Date(baseMs + m.round * 90 * 60_000 + indexInRound * 30 * 60_000);
    return { ...m, scheduledAt: start.toISOString(), startsAt: start.toISOString() };
  });
}

/**
 * Roster de un torneo: los inscritos reales de esa copa más los jugadores de
 * la comunidad que la app usa para completar las cupas. Todo se ordena por
 * ELO del juego del torneo, porque la semilla es por ELO.
 */
export function seedRosterFor(
  t: Pick<Tournament, "id" | "slots" | "gameId" | "organizerId">,
  registrations: Record<string, string[]>,
  eloOf: (playerId: string, game: GameId) => EloRecord,
): string[] {
  const registered = Object.entries(registrations)
    .filter(([, ids]) => ids.includes(t.id))
    .map(([userId]) => userId);

  const pool = players.filter((p) => p.id !== t.organizerId).map((p) => p.id);

  const unique = [...new Set([...registered, ...pool])];
  return unique
    .sort((a, b) => eloOf(b, t.gameId).rating - eloOf(a, t.gameId).rating)
    .slice(0, Math.min(t.slots, 64));
}
