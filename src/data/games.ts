import type { IconName } from "../components/ui/Icon";

/* Registro canónico de juegos. El ELO se calcula por juego,
   así que cada id es la clave de todo el sistema de ranking. */

export type GameId =
  "fifa26" | "efootball" | "valorant" | "lol" | "minecraft" | "fortnite" | "tekken8";

export interface Game {
  id: GameId;
  name: string;
  /** etiqueta corta para chips y filtros */
  short: string;
  publisher: string;
  /** el juego "puente" hacia oportunidades en frustradas de organizador */
  icon: IconName;
  accent: string;
  description: string;
  /** aparece en la grilla de populares del browse de juegos */
  popular?: boolean;
}

export const GAMES: Game[] = [
  {
    id: "fifa26",
    name: "FIFA26",
    short: "FIFA",
    publisher: "EA SPORTS",
    icon: "gamepad",
    accent: "hsl(150 70% 42%)",
    description: "Fútbol 11 contra 11, la vía directa a EA Sports FC.",
    popular: true,
  },
  {
    id: "efootball",
    name: "E FOOTBALL",
    short: "EFOOT",
    publisher: "EA SPORTS",
    icon: "gamepad",
    accent: "hsl(160 65% 38%)",
    description: "Fútbol rápido en móvil y consola.",
  },
  {
    id: "valorant",
    name: "VALORANT",
    short: "VAL",
    publisher: "RIOT GAMES",
    icon: "crosshair",
    accent: "hsl(354 72% 48%)",
    description: "Táctico 5v5 de disparos.",
    popular: true,
  },
  {
    id: "lol",
    name: "LOL",
    short: "LOL",
    publisher: "RIOT GAMES",
    icon: "gamepad",
    accent: "hsl(210 80% 55%)",
    description: "MOBA 5v5 de líneas.",
    popular: true,
  },
  {
    id: "minecraft",
    name: "MINECRAFT",
    short: "MC",
    publisher: "MOJANG",
    icon: "layers",
    accent: "hsl(120 45% 42%)",
    description: "Construcción y supervivencia por equipos.",
  },
  {
    id: "fortnite",
    name: "FORTNITE",
    short: "FN",
    publisher: "EPIC GAMES",
    icon: "cloud",
    accent: "hsl(268 75% 58%)",
    description: "Battle Royale multiplataforma.",
  },
  {
    id: "tekken8",
    name: "TEKKEN 8",
    short: "TK8",
    publisher: "BANDAI NAMCO",
    icon: "users",
    accent: "hsl(20 78% 52%)",
    description: "Lucha 1v1.",
  },
];

export const GAME_IDS: GameId[] = GAMES.map((g) => g.id);

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gameName(id: string): string {
  return getGame(id)?.name ?? "—";
}

export function gameShort(id: string): string {
  return getGame(id)?.short ?? "—";
}

/** ¿Este juego da acceso a oportunidades en EA Sports? */
export function isEASportsPath(id: string): boolean {
  return id === "fifa26" || id === "efootball";
}
