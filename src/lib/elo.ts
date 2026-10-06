import type { GameId } from "../data/games";

/* ============================================================
   Motor de ELO por juego (sistema FIDE / Chess.com simplificado)

   Se usa el clásico con factor K dinámico:
     -<K 32)                 general
     - K 40                hasta 15 partidas (periodo de revelación)
     - K 24                desde 30 partidas y rating >= 2000 (estabilización)

   El margen de victoria (score diff) escala el delta hasta 1.6x,
   de modo que una goleada 5-0 mueve más que un 1-0 ajustado.
   ============================================================ */

export const BASE_ELO = 1500;

export interface EloRecord {
  rating: number;
  /** partidas disputadas en este juego */
  played: number;
  wins: number;
  losses: number;
  draws: number;
  /** mejor rating alcanzado, para mostrar "peak" en el perfil */
  peak: number;
  /** racha actual: positiva = victorias, negativa = derrotas */
  streak: number;
}

export function emptyElo(rating = BASE_ELO): EloRecord {
  return { rating, played: 0, wins: 0, losses: 0, draws: 0, peak: rating, streak: 0 };
}

export function kFactor(r: EloRecord): number {
  if (r.played < 15) return 40;
  if (r.played >= 30 && r.rating >= 2000) return 24;
  return 32;
}

export function expectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

/** Escala por margen de victoria, acotada para evitar outliers extremos. */
export function marginMultiplier(goalDiff: number): number {
  return 1 + Math.min(0.6, Math.log1p(Math.abs(goalDiff)) * 0.18);
}

export type Outcome = "win" | "loss" | "draw";

export interface EloUpdate {
  before: number;
  after: number;
  delta: number;
}

export interface EloPairUpdate {
  winner: EloUpdate;
  loser: EloUpdate;
}

function applyOutcome(
  player: EloRecord,
  score: number,
  opponentRating: number,
  goalDiff: number,
): EloUpdate {
  const before = player.rating;
  const exp = expectedScore(before, opponentRating);
  const raw = kFactor(player) * (score - exp);
  const scaled = Math.round(raw * marginMultiplier(goalDiff));
  /* Un resultado siempre mueve el rating: sin este piso, ganarle a un
     favorito devuelve 0 y la racha y el ranking dejan de responder. */
  const delta = score === 1 ? Math.max(scaled, 1) : score === 0 ? Math.min(scaled, -1) : scaled;
  const after = Math.max(100, before + delta);
  return { before, after, delta: after - before };
}

function withResult(record: EloRecord, outcome: Outcome, newRating: number): EloRecord {
  return {
    rating: newRating,
    peak: Math.max(record.peak, newRating),
    played: record.played + 1,
    wins: record.wins + (outcome === "win" ? 1 : 0),
    losses: record.losses + (outcome === "loss" ? 1 : 0),
    draws: (record.draws ?? 0) + (outcome === "draw" ? 1 : 0),
    streak:
      outcome === "win"
        ? record.streak + 1
        : outcome === "loss"
          ? Math.min(0, record.streak) - 1
          : 0,
  };
}

/**
 * Calcula el resultado de una partida y devuelve los dos ELO actualizados.
 * `scoreA`/`scoreB` son los puntos marcados (sets o goles).
 */
export function rateMatch(
  a: EloRecord,
  b: EloRecord,
  scoreA: number,
  scoreB: number,
): { a: EloRecord; b: EloRecord; updates: EloPairUpdate } {
  if (scoreA === scoreB) {
    const ua = applyOutcome(a, 0.5, b.rating, 0);
    const ub = applyOutcome(b, 0.5, a.rating, 0);
    return {
      a: withResult(a, "draw", ua.after),
      b: withResult(b, "draw", ub.after),
      updates: { winner: ua, loser: ub },
    };
  }

  const aWins = scoreA > scoreB;
  const diff = Math.abs(scoreA - scoreB);
  const winner = aWins ? a : b;
  const loser = aWins ? b : a;
  const winnerRating = winner.rating;
  const loserRating = loser.rating;

  const uw = applyOutcome(winner, 1, loserRating, diff);
  const ul = applyOutcome(loser, 0, winnerRating, diff);

  return {
    a: aWins ? withResult(a, "win", uw.after) : withResult(a, "loss", ul.after),
    b: aWins ? withResult(b, "loss", ul.after) : withResult(b, "win", uw.after),
    updates: { winner: uw, loser: ul },
  };
}

/** Etiqueta de liga según el rating, usada en el perfil y el ranking. */
export function eloTier(rating: number): {
  label: string;
  tone: "neutral" | "primary" | "success" | "warning";
} {
  if (rating >= 2200) return { label: "GRANDE MAESTRO", tone: "success" };
  if (rating >= 2000) return { label: "MAESTRO", tone: "success" };
  if (rating >= 1750) return { label: "DIAMANTE", tone: "primary" };
  if (rating >= 1600) return { label: "PLATA", tone: "primary" };
  if (rating >= 1400) return { label: "BRONCE", tone: "warning" };
  return { label: "NOVATO", tone: "neutral" };
}

/** Rango dentro de una tabla ordenada (1-indexado). */
export function rankIn(list: { elo: EloRecord }[]): number[] {
  const sorted = [...list].sort((x, y) => y.elo.rating - x.elo.rating);
  return sorted.map((p) => sorted.indexOf(p) + 1);
}

export function defaultEloFor(
  game: GameId,
  seeds: Partial<Record<GameId, EloRecord>> = {},
): EloRecord {
  return seeds[game] ?? emptyElo();
}
