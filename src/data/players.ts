import { emptyElo, type EloRecord } from "../lib/elo";
import type { GameId } from "./games";

/* ============================================================
   Usuarios. El ELO vive en `elo`, indexado por juego — es el
   corazón del producto: competir en FIFA26 no mueve tu Valorant.

   `organizer` no es un rol permanente: casi todos los usuarios son
   jugadores, y organizar es una capacidad que se desbloquea con
   reputación (ELO alto, historial limpio, seguidores).
   ============================================================ */

export type OrganizerTier = "comunidad" | "verificado" | "editorial";

export interface OrganizerProfile {
  tier: OrganizerTier;
  /** motivo por el que la app le permite cobrar premio en efectivo */
  verifiedPrizes: boolean;
  tournamentsCreated: number;
  /** disputas perdidas: baja la confianza y bloquea premios altos */
  disputesLost: number;
  followers: number;
  since: string;
  bio?: string;
}

export interface Player {
  id: string;
  name: string;
  handle: string;
  /** ELO por juego; solo incluye los juegos en los que ha competir */
  elo: Partial<Record<GameId, EloRecord>>;
  mainGame: GameId;
  organizer?: OrganizerProfile;
  /** marca de cuenta de EA Sports / scouting */
  scouted?: boolean;
  joined: string;
}

function elo(
  rating: number,
  played: number,
  wins: number,
  losses: number,
  draws = 0,
  streak = 0,
): EloRecord {
  return { rating, played, wins, losses, draws, peak: Math.max(rating, BASE_PEAK(rating)), streak };
}

function BASE_PEAK(r: number) {
  return r;
}

const featured: Player[] = [
  {
    id: "u1",
    name: "T1 COTILLO",
    handle: "@t1cotillo",
    mainGame: "fifa26",
    joined: "2025-08-12",
    scouted: true,
    elo: {
      fifa26: elo(2140, 62, 41, 15, 6, 4),
      efootball: elo(1980, 28, 19, 7, 2, 2),
      valorant: elo(1720, 14, 8, 5, 1, 0),
    },
    organizer: {
      tier: "verificado",
      verifiedPrizes: true,
      tournamentsCreated: 34,
      disputesLost: 1,
      followers: 4820,
      since: "2025-09-02",
      bio: "Torneos diarios de FIFA y E Football. Cupas abiertas, sin scripts.",
    },
  },
  {
    id: "u2",
    name: "USUARIO1",
    handle: "@usuario1",
    mainGame: "fifa26",
    joined: "2025-09-30",
    elo: { fifa26: elo(2050, 48, 30, 14, 4, -1), valorant: elo(1840, 22, 13, 8, 1, 1) },
  },
  {
    id: "u3",
    name: "USUARIO 2",
    handle: "@usuario2",
    mainGame: "valorant",
    joined: "2025-10-14",
    elo: { valorant: elo(2210, 71, 48, 17, 6, 6), lol: elo(1650, 19, 10, 8, 1, 0) },
  },
  {
    id: "u4",
    name: "USUARIO3",
    handle: "@usuario3",
    mainGame: "lol",
    joined: "2025-11-02",
    elo: { lol: elo(1990, 39, 24, 12, 3, 2), minecraft: elo(1520, 11, 6, 4, 1, 0) },
  },
  {
    id: "u5",
    name: "USUARIO 4",
    handle: "@usuario4",
    mainGame: "fortnite",
    joined: "2025-11-20",
    elo: { fortnite: elo(1880, 34, 20, 11, 3, 1), minecraft: elo(1610, 16, 9, 6, 1, 1) },
  },
  {
    id: "u6",
    name: "NOVA STRIKE",
    handle: "@novastrike",
    mainGame: "valorant",
    joined: "2025-12-05",
    elo: { valorant: elo(2330, 84, 58, 19, 7, 9), lol: elo(1780, 26, 15, 9, 2, 3) },
    scouted: true,
  },
  {
    id: "u7",
    name: "IRONMASK",
    handle: "@ironmask",
    mainGame: "tekken8",
    joined: "2026-01-08",
    elo: { tekken8: elo(2075, 44, 29, 12, 3, 2), fortnite: elo(1490, 9, 4, 4, 1, -1) },
    organizer: {
      tier: "comunidad",
      verifiedPrizes: false,
      tournamentsCreated: 6,
      disputesLost: 0,
      followers: 310,
      since: "2026-01-15",
      bio: "Luchas 1v1 semanales. Aprende y mejora.",
    },
  },
  {
    id: "u8",
    name: "PIXELGROVE",
    handle: "@pixelgrove",
    mainGame: "minecraft",
    joined: "2026-01-22",
    elo: { minecraft: elo(1760, 23, 14, 7, 2, 3), efootball: elo(1340, 6, 2, 3, 1, 0) },
  },
  {
    id: "u9",
    name: "RUSHMODE",
    handle: "@rushmode",
    mainGame: "fortnite",
    joined: "2025-10-28",
    scouted: true,
    elo: { fortnite: elo(2120, 55, 35, 16, 4, 5), tekken8: elo(1450, 8, 4, 3, 1, 1) },
    organizer: {
      tier: "verificado",
      verifiedPrizes: true,
      tournamentsCreated: 21,
      disputesLost: 0,
      followers: 2140,
      since: "2025-11-20",
      bio: "Eventos de Fortnite y duelRanked. Organizo desde 2025.",
    },
  },
  {
    id: "u10",
    name: "CATALINA R",
    handle: "@catalinar",
    mainGame: "efootball",
    joined: "2026-02-01",
    elo: { efootball: elo(1910, 31, 19, 10, 2, 2), fifa26: elo(1700, 18, 10, 6, 2, 0) },
  },
  {
    id: "u11",
    name: "DIABLO9",
    handle: "@diablo9",
    mainGame: "lol",
    joined: "2025-12-19",
    elo: { lol: elo(2150, 49, 33, 13, 3, 3), valorant: elo(1520, 10, 5, 4, 1, 0) },
  },
  {
    id: "u12",
    name: "LUMINA",
    handle: "@lumina",
    mainGame: "minecraft",
    joined: "2026-02-10",
    elo: { minecraft: elo(1830, 26, 16, 8, 2, 2), fortnite: elo(1290, 5, 2, 2, 1, 0) },
    organizer: {
      tier: "comunidad",
      verifiedPrizes: false,
      tournamentsCreated: 3,
      disputesLost: 0,
      followers: 88,
      since: "2026-02-12",
      bio: "Torneos de construcción y supervivencia.",
    },
  },
];

/* ---------- comunidad ----------
   Los usuarios de arriba son los que tienen historia visible en la app. Pero
   una copa de 32 o 64 cupas necesita más cuerpos que llenarse, y el producto
   promete que la app se encarga de completar el cuadro. Así que la comunidad
   se genera con una semilla fija: es siempre la misma en cada carga, con
   ELO plausible y coherente por juego (nadie juega a 2200 en todos). */

const COMMUNITY_TAGS = [
  "ROXANNA",
  "KIKO",
  "VELOZ",
  "NOVA9",
  "DRAKO",
  "PIXEL",
  "TITAN",
  "ZEFIRO",
  "BLAZE",
  "MOKO",
  "RUSTICO",
  "ONYX",
  "KAORI",
  "SOLARIS",
  "WIZARD",
  "KANO",
  "FERRO",
  "LYNX",
  "MOTA",
  "ARCO",
  "BRIO",
  "CENIT",
  "DUNA",
  "ECO",
  "FARO",
  "GAVI",
  "HALO",
  "INDIGO",
  "JARU",
  "KEO",
  "LUMI",
  "MIRO",
  "NANO",
  "ORION",
  "PERLA",
  "QUILL",
  "RICO",
  "SOMA",
  "TANO",
  "UMBRAL",
  "VETA",
  "WAVE",
  "XENO",
  "YAGO",
  "ZURI",
  "AURA",
  "BITA",
  "CIMA",
  "DORO",
  "ERIS",
  "FIBRA",
  "GLAZ",
  "HUESO",
  "IRIS",
  "LOTO",
  "MAREA",
  "NUBE",
  "OSO",
];

const COMMUNITY_GAMES: GameId[] = [
  "fifa26",
  "efootball",
  "valorant",
  "lol",
  "minecraft",
  "fortnite",
  "tekken8",
];

/** PRNG determinista: la comunidad no puede cambiar entre recargas. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function communityPlayer(index: number): Player {
  const rng = seeded(7919 + index * 104729);
  const tag = COMMUNITY_TAGS[index];
  const mainGame = COMMUNITY_GAMES[index % COMMUNITY_GAMES.length];
  const map: Partial<Record<GameId, EloRecord>> = {};

  /* el juego principal: el jugador vive de este */
  const played = 6 + Math.floor(rng() * 110);
  const winRate = 0.32 + rng() * 0.36;
  const wins = Math.max(1, Math.round(played * winRate));
  const draws = rng() < 0.35 ? Math.floor(rng() * Math.max(1, played - wins)) : 0;
  const losses = Math.max(0, played - wins - draws);
  const rating = 980 + Math.floor(rng() * 1020);
  const streak = rng() < 0.5 ? 1 + Math.floor(rng() * 4) : -(1 + Math.floor(rng() * 3));
  map[mainGame] = elo(rating, played, wins, losses, draws, streak);

  /* y algún juego más, con menos partidas y un techo más bajo */
  const extras = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < extras; i++) {
    const game = COMMUNITY_GAMES[Math.floor(rng() * COMMUNITY_GAMES.length)];
    if (map[game]) continue;
    const p = 3 + Math.floor(rng() * 34);
    const w = Math.max(1, Math.round(p * (0.28 + rng() * 0.36)));
    const l = Math.max(0, p - w);
    map[game] = elo(820 + Math.floor(rng() * 780), p, w, l, 0, rng() < 0.5 ? 1 : -1);
  }

  const joined = new Date(Date.UTC(2025, 4, 6) + index * 11 * 86400000).toISOString().slice(0, 10);

  return {
    id: `c${index + 1}`,
    name: tag,
    handle: `@${tag.toLowerCase()}`,
    mainGame,
    joined,
    elo: map,
  };
}

const community = COMMUNITY_TAGS.map((_, i) => communityPlayer(i));

export const players: Player[] = [...featured, ...community];

export function getPlayer(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export function playerName(id: string): string {
  return getPlayer(id)?.name ?? "—";
}

/** ELO de un jugador en un juego; 1500 si aún no compitió. */
export function eloOf(playerId: string, game: GameId): EloRecord {
  return getPlayer(playerId)?.elo[game] ?? emptyElo();
}

/* ---------- el usuario de esta sesión ---------- */
export const CURRENT_USER_ID = "u1";
