import type { GameId } from "./games";

/* ============================================================
   Torneos y series diarias.

   El organizador únicamente define: nombre, juego, formato, reglas,
   premio y cupas. NO siembra, NO gestiona rondas ni resultados —
   eso lo hace la app (ver lib/bracket.ts y lib/api/scheduler.ts).
   ============================================================ */

export type Modality = "Virtual" | "Presencial";
export type TournamentStatus = "upcoming" | "live" | "finished";
export type Format = "eliminacion" | "grupos" | "suizo" | "doble_eliminacion";

export interface Prize {
  /** efectivo requiere verificación del organizador */
  amount: number;
  currency: "USD" | "ARS" | "PTS";
  kind: "efectivo" | "creditos" | "ninguno";
  /** reparto por porcentaje: [1º, 2º, 3º] */
  split: [number, number, number];
}

export interface Rules {
  minElo: number;
  /** la app la usa para validar la inscripción automáticamente */
  maxParticipants: number;
  /** cada jugador debe confirmar su resultado */
  requireConfirmation: boolean;
  /** minutos para impugnar antes de que se confirme solo */
  disputeWindowMin: number;
  /** desconexión: la app da la partida al rival */
  autoForfeitOnDisconnect: boolean;
  /** repetición de horario si el torneo es diario */
  bestOf: 1 | 3 | 5;
  notes: string;
}

export interface Tournament {
  id: string;
  name: string;
  gameId: GameId;
  organizerId: string;
  /** cuenta editorial (Riot, Epic, EA) o comunidad */
  publisherTier: "editorial" | "comunidad";
  modality: Modality;
  format: Format;
  date: string;
  time: string;
  timezone: string;
  enrolled: number;
  slots: number;
  prize: Prize;
  rules: Rules;
  status: TournamentStatus;
  phase?: string;
  featured?: boolean;
}

/* ---------- copy literal del prototipo ---------- */
export const TOURNAMENT_RULES_TEXT =
  "PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS";

/* ============================================================
   Series diarias: la app genera las instancias a partir de la
   plantilla, así que un torneo "todos los días" no se escribe a mano.
   ============================================================ */

export interface DailySeries {
  id: string;
  tournamentId: string;
  /** 0 = domingo … 6 = sábado */
  days: number[];
  /** cuántas instancias futuras se materializan */
  horizonDays: number;
}

export const dailySeries: DailySeries[] = [
  { id: "s1", tournamentId: "daily-fifa-cup", days: [1, 2, 3, 4, 5, 6, 0], horizonDays: 7 },
  { id: "s2", tournamentId: "daily-valorant-open", days: [2, 4, 6], horizonDays: 7 },
  { id: "s3", tournamentId: "daily-lol-amateur", days: [1, 3, 5], horizonDays: 7 },
  { id: "s4", tournamentId: "daily-mc-build", days: [6, 0], horizonDays: 7 },
];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function dayOfWeek(iso: string): number {
  return new Date(`${iso}T12:00:00`).getDay();
}

/* ============================================================
   Torneos base
   ============================================================ */

const defaultRules = (over: Partial<Rules> = {}): Rules => ({
  minElo: 150,
  maxParticipants: 16,
  requireConfirmation: true,
  disputeWindowMin: 24,
  autoForfeitOnDisconnect: true,
  bestOf: 3,
  notes: TOURNAMENT_RULES_TEXT,
  ...over,
});

const noPrize: Prize = { amount: 0, currency: "USD", kind: "ninguno", split: [0, 0, 0] };

export const tournaments: Tournament[] = [
  {
    id: "summer-cup-fifa26",
    name: "TORNEO SUMMER CUP",
    gameId: "fifa26",
    organizerId: "o-riot",
    publisherTier: "editorial",
    modality: "Virtual",
    format: "grupos",
    date: "2026-02-10",
    time: "18:00",
    timezone: "GMT-4",
    enrolled: 10,
    slots: 16,
    prize: { amount: 500, currency: "USD", kind: "efectivo", split: [60, 25, 15] },
    rules: defaultRules({ minElo: 150 }),
    status: "live",
    phase: "FASE DE GRUPOS-GRUPO A",
    featured: true,
  },
  {
    id: "super-cup-fifa",
    name: "TORNEO SUPER CUP - FIFA",
    gameId: "fifa26",
    organizerId: "o-ea",
    publisherTier: "editorial",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-02-10",
    time: "18:00",
    timezone: "GMT-4",
    enrolled: 10,
    slots: 16,
    prize: { amount: 500, currency: "USD", kind: "efectivo", split: [70, 30, 0] },
    rules: defaultRules({ minElo: 150 }),
    status: "upcoming",
  },
  {
    id: "super-cup-valo",
    name: "TORNEO SUPER CUP - VALO",
    gameId: "valorant",
    organizerId: "o-riot",
    publisherTier: "editorial",
    modality: "Presencial",
    format: "eliminacion",
    date: "2026-03-14",
    time: "20:00",
    timezone: "GMT-4",
    enrolled: 17,
    slots: 80,
    prize: { amount: 1200, currency: "USD", kind: "efectivo", split: [60, 25, 15] },
    rules: defaultRules({ minElo: 150, bestOf: 5, maxParticipants: 80 }),
    status: "upcoming",
  },
  {
    id: "valorant-regional",
    name: "TORNEO VALORANT",
    gameId: "valorant",
    organizerId: "u3",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-03-02",
    time: "17:00",
    timezone: "GMT-4",
    enrolled: 12,
    slots: 32,
    prize: { amount: 300, currency: "USD", kind: "efectivo", split: [70, 30, 0] },
    rules: defaultRules({ minElo: 1200 }),
    status: "upcoming",
  },
  {
    id: "lol-open",
    name: "TORNEO LOL",
    gameId: "lol",
    organizerId: "u11",
    publisherTier: "comunidad",
    modality: "Presencial",
    format: "suizo",
    date: "2026-03-08",
    time: "19:00",
    timezone: "GMT-4",
    enrolled: 8,
    slots: 16,
    prize: { amount: 250, currency: "USD", kind: "efectivo", split: [60, 25, 15] },
    rules: defaultRules({ minElo: 1400, maxParticipants: 16 }),
    status: "upcoming",
  },
  {
    id: "minecraft-craft",
    name: "TORNEO MINECRAFT",
    gameId: "minecraft",
    organizerId: "u12",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "doble_eliminacion",
    date: "2026-03-20",
    time: "16:00",
    timezone: "GMT-4",
    enrolled: 24,
    slots: 64,
    prize: { amount: 180, currency: "USD", kind: "creditos", split: [50, 30, 20] },
    rules: defaultRules({ minElo: 100, maxParticipants: 64, bestOf: 3 }),
    status: "upcoming",
  },
  {
    id: "fortnite-cup",
    name: "TORNEO FORTNITE",
    gameId: "fortnite",
    organizerId: "u9",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-04-01",
    time: "21:00",
    timezone: "GMT-4",
    enrolled: 40,
    slots: 64,
    prize: { amount: 900, currency: "USD", kind: "efectivo", split: [70, 20, 10] },
    rules: defaultRules({ minElo: 1600, maxParticipants: 64, bestOf: 5 }),
    status: "upcoming",
  },
  {
    id: "tekken-8",
    name: "TORNEO TEKKEN 8",
    gameId: "tekken8",
    organizerId: "u7",
    publisherTier: "comunidad",
    modality: "Presencial",
    format: "eliminacion",
    date: "2026-04-11",
    time: "18:00",
    timezone: "GMT-4",
    enrolled: 6,
    slots: 16,
    prize: noPrize,
    rules: defaultRules({ minElo: 1200, maxParticipants: 16, bestOf: 5 }),
    status: "upcoming",
  },
  {
    id: "efootball-league",
    name: "TORNEO E FOOTBALL",
    gameId: "efootball",
    organizerId: "o-ea",
    publisherTier: "editorial",
    modality: "Presencial",
    format: "grupos",
    date: "2026-03-25",
    time: "15:00",
    timezone: "GMT-4",
    enrolled: 14,
    slots: 32,
    prize: { amount: 350, currency: "USD", kind: "efectivo", split: [50, 30, 20] },
    rules: defaultRules({ minElo: 800, maxParticipants: 32 }),
    status: "upcoming",
  },

  /* ---- plantillas de las series diarias ---- */
  {
    id: "daily-fifa-cup",
    name: "FIFA DAILY CUP",
    gameId: "fifa26",
    organizerId: "u1",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-01-01",
    time: "20:00",
    timezone: "GMT-3",
    enrolled: 0,
    slots: 32,
    prize: { amount: 50, currency: "USD", kind: "creditos", split: [100, 0, 0] },
    rules: defaultRules({ minElo: 1200, maxParticipants: 32, bestOf: 3 }),
    status: "upcoming",
  },
  {
    id: "daily-valorant-open",
    name: "VALORANT DAILY OPEN",
    gameId: "valorant",
    organizerId: "u3",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-01-01",
    time: "21:00",
    timezone: "GMT-3",
    enrolled: 0,
    slots: 16,
    prize: { amount: 30, currency: "USD", kind: "creditos", split: [100, 0, 0] },
    rules: defaultRules({ minElo: 1400, maxParticipants: 16 }),
    status: "upcoming",
  },
  {
    id: "daily-lol-amateur",
    name: "LOL AMATEUR NIGHT",
    gameId: "lol",
    organizerId: "u11",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-01-01",
    time: "22:00",
    timezone: "GMT-3",
    enrolled: 0,
    slots: 16,
    prize: { amount: 25, currency: "USD", kind: "creditos", split: [100, 0, 0] },
    rules: defaultRules({ minElo: 1100, maxParticipants: 16 }),
    status: "upcoming",
  },
  {
    id: "daily-mc-build",
    name: "MINECRAFT BUILD DUEL",
    gameId: "minecraft",
    organizerId: "u12",
    publisherTier: "comunidad",
    modality: "Virtual",
    format: "eliminacion",
    date: "2026-01-01",
    time: "19:00",
    timezone: "GMT-3",
    enrolled: 0,
    slots: 8,
    prize: noPrize,
    rules: defaultRules({ minElo: 1000, maxParticipants: 8, bestOf: 3 }),
    status: "upcoming",
  },
];

export function getTournament(id: string): Tournament | undefined {
  return tournaments.find((t) => t.id === id);
}

export function tournamentsByGame(gameId: GameId): Tournament[] {
  return tournaments.filter((t) => t.gameId === gameId);
}

/**
 * Materializa las instancias de las series diarias alrededor de hoy.
 * Es lo que permite "torneos diarios" sin escribir un array a mano.
 */
export function upcomingDaily(): Tournament[] {
  const out: Tournament[] = [];
  const today = todayISO();

  for (const s of dailySeries) {
    const base = getTournament(s.tournamentId);
    if (!base) continue;

    for (let i = 0; i < s.horizonDays; i++) {
      const date = addDaysISO(today, i);
      if (!s.days.includes(dayOfWeek(date))) continue;
      out.push({
        ...base,
        id: `${base.id}-${date}`,
        date,
        status: date === today ? "live" : "upcoming",
        featured: false,
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

/** Todos los torneos "reales" más las instancias materializadas. */
export function allTournaments(): Tournament[] {
  const dailies = upcomingDaily();
  const baseIds = new Set(dailySeries.map((s) => s.tournamentId));
  return [...tournaments.filter((t) => !baseIds.has(t.id)), ...dailies];
}

/** ¿El torneo está agendado para hoy? */
export function isScheduledToday(iso: string): boolean {
  return iso === todayISO();
}

/** Texto de reglas legible, generado desde las reglas estructuradas. */
export function rulesText(t: Tournament): string {
  const r = t.rules;
  const lines = [
    `ELO mínimo: ${r.minElo} en ${gameLabel(t.gameId)}.`,
    `Formato: al mejor de ${r.bestOf} · ${FORMAT_LABELS[t.format]}.`,
    r.requireConfirmation
      ? `El rival tiene ${r.disputeWindowMin}h para confirmar o impugnar cada resultado.`
      : "Los resultados se confirman automáticamente al terminarse la partida.",
    r.autoForfeitOnDisconnect
      ? "Si un jugador se desconecta, la partida se da a favor del rival."
      : "",
    r.notes ? r.notes : "",
  ];
  return lines.filter(Boolean).join(" ");
}

/** Etiqueta corta del juego, para cards y cabeceras. */
export function gameLabel(id: GameId): string {
  return id.toUpperCase();
}

/** Hoy, agrupado por juego, para la pantalla de inicio. */
export function todayByGame(): Map<GameId, Tournament[]> {
  const map = new Map<GameId, Tournament[]>();
  const today = todayISO();

  for (const t of allTournaments()) {
    if (t.date !== today) continue;
    const list = map.get(t.gameId) ?? [];
    list.push(t);
    map.set(t.gameId, list);
  }

  for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
  return map;
}

export const FORMAT_LABELS: Record<Format, string> = {
  eliminacion: "Eliminación simple",
  grupos: "Fase de grupos",
  suizo: "Suizo",
  doble_eliminacion: "Doble eliminación",
};

/** El organizador necesita verificación para pagar en efectivo. */
export function requiresVerification(t: Pick<Tournament, "prize">): boolean {
  return t.prize.kind === "efectivo" && t.prize.amount > 0;
}
