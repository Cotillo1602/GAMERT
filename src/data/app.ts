import { getPlayer } from "./players";

/* Cuentas editoriales de publishers. No son usuarios competidores: son
   cuentas que publica la plataforma y tienen `verifiedPrizes` garantizado. */

export interface PublisherAccount {
  id: string;
  name: string;
  handle: string;
  tier: "editorial";
  verifiedPrizes: boolean;
  followers: number;
  gameIds: string[];
}

export const publishers: PublisherAccount[] = [
  {
    id: "o-riot",
    name: "RIOT GAMES",
    handle: "@riotgames",
    tier: "editorial",
    verifiedPrizes: true,
    followers: 245_000,
    gameIds: ["valorant", "lol"],
  },
  {
    id: "o-epic",
    name: "EPIC GAMES",
    handle: "@epicgames",
    tier: "editorial",
    verifiedPrizes: true,
    followers: 97_400,
    gameIds: ["fortnite"],
  },
  {
    id: "o-ea",
    name: "EA SPORTS",
    handle: "@easports",
    tier: "editorial",
    verifiedPrizes: true,
    followers: 128_000,
    gameIds: ["fifa26", "efootball"],
  },
  {
    id: "o-bandai",
    name: "BANDAI NAMCO",
    handle: "@bandainamco",
    tier: "editorial",
    verifiedPrizes: true,
    followers: 54_900,
    gameIds: ["tekken8"],
  },
  {
    id: "o-mojang",
    name: "MOJANG",
    handle: "@mojang",
    tier: "editorial",
    verifiedPrizes: true,
    followers: 71_200,
    gameIds: ["minecraft"],
  },
];

/* Cuentas de comunidad que organizan sobre la plataforma (siguen a players.ts). */
export const communityOrganizers = ["u1", "u3", "u7", "u9", "u11", "u12"];

export function isPublisher(id: string): boolean {
  return publishers.some((p) => p.id === id);
}

export function isEditorial(id: string): boolean {
  return isPublisher(id);
}

/** Nombre visible del organizador: cuenta editorial o jugador de comunidad. */
export function organizerName(id: string): string {
  return publishers.find((p) => p.id === id)?.name ?? getPlayer(id)?.name ?? "GAMERT";
}

/** Un organizador de comunidad puede cobrar en efectivo si la plataforma lo habilitó. */
export function canPayCash(organizerId: string): boolean {
  if (isPublisher(organizerId)) return true;
  return getPlayer(organizerId)?.organizer?.verifiedPrizes ?? false;
}

/** Cuenta editorial responsable de un juego (EA SPORTS para fifa26/efootball). */
export function publisherFor(gameId: string): PublisherAccount | undefined {
  return publishers.find((p) => p.gameIds.includes(gameId));
}

/** Las dos familias de cuentas que pueden organizar sobre la plataforma. */
export function allOrganizerAccounts() {
  return {
    editorial: publishers,
    comunidad: communityOrganizers,
  };
}

/* ============================================================
   Notificaciones — ahora las genera la app al confirmarse partidas.
   ============================================================ */

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  kind: "torneo" | "pago" | "elo" | "sistema";
  gameId?: string;
}

export const notificationsEmpty = {
  title: "! Esto está vacío !",
  body: "No tienes ningun mensaje en notificaciones",
};

export const seedNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "FIFA DAILY CUP empieza en 30 minutos",
    body: "Confirma tu asistencia para que la app te siembre.",
    date: "2026-02-10T17:30",
    read: false,
    kind: "torneo",
    gameId: "fifa26",
  },
  {
    id: "n2",
    title: "Partida confirmada: ganaste +18 ELO en FIFA26",
    body: "Ahora sos 2140. Te faltan 60 puntos para el nivel GRANDE MAESTRO.",
    date: "2026-01-28T10:00",
    read: false,
    kind: "elo",
    gameId: "fifa26",
  },
  {
    id: "n3",
    title: "Premio acreditado: $300 en TORNEO VALORANT",
    body: "El pago se acreditó a tu billetera.",
    date: "2026-01-27T18:20",
    read: true,
    kind: "pago",
    gameId: "valorant",
  },
  {
    id: "n4",
    title: "Verificación en dos pasos",
    body: "Activá la verificación para poder cobrar premios como organizador.",
    date: "2026-01-25T09:00",
    read: true,
    kind: "sistema",
  },
];

/* ============================================================
   Billetera
   ============================================================ */

export type MovementKind = "RECARGA" | "RETIRO" | "PREMIO";

export interface WalletMovement {
  id: string;
  kind: MovementKind;
  amount: number;
  success: boolean;
  date: string;
  label?: string;
}

export const walletHistory: WalletMovement[] = [
  { id: "w1", kind: "RETIRO", amount: 30, success: true, date: "2026-01-28" },
  {
    id: "w2",
    kind: "PREMIO",
    amount: 300,
    success: true,
    date: "2026-01-27",
    label: "TORNEO VALORANT",
  },
  { id: "w3", kind: "RECARGA", amount: 7, success: true, date: "2026-01-25" },
  { id: "w4", kind: "RECARGA", amount: 5, success: true, date: "2026-01-20" },
  { id: "w5", kind: "RETIRO", amount: 15, success: false, date: "2026-01-18" },
  {
    id: "w6",
    kind: "PREMIO",
    amount: 120,
    success: true,
    date: "2026-01-12",
    label: "LOL AMATEUR NIGHT",
  },
  { id: "w7", kind: "RECARGA", amount: 10, success: true, date: "2026-01-05" },
];

/* ============================================================
   Copia literal del prototipo
   ============================================================ */

export const featuredPlayersCopy =
  "Estos son los jugadores destacados de la semana. Recuerda que puedes ser uno de ellos subiendo tu ELO y siendo constante. Espero verte aqui.";

export const appVersion = "GamerT v1.0.0 (Beta) - Desarrollado por CORCADEV";

/* ---------- fidget spinners de género (design system del .fig) ---------- */
export const genres = [
  "Heist",
  "Blockbuster",
  "Grindhouse",
  "Biopic",
  "Spaghetti Western",
  "Slasher",
  "Hardboiled",
  "Vérité",
  "Epic",
  "Screwball",
  "Rom-com",
  "Noir",
  "Propaganda",
  "Melodrama",
  "New Wave",
  "Bubblegum",
  "Witch house",
  "Shoegaze",
  "Honky-tonk",
  "Screamo",
  "Drone",
  "Doo-wop",
  "Spoken word",
  "Vaporwave",
  "Oi!",
] as const;
