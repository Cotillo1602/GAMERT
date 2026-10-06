import { isBye, scheduleRounds, settleMatch, type Match } from "../bracket";
import type { EloRecord } from "../elo";
import { eloOf as baseElo, CURRENT_USER_ID } from "../../data/players";
import {
  seedNotifications,
  walletHistory,
  type AppNotification,
  type WalletMovement,
} from "../../data/app";
import { allTournaments, type Tournament } from "../../data/tournaments";

/* ============================================================
   Store demo: fuente única de verdad del estado local.

   La capa API (src/lib/api/*) y el AppContext comparten el mismo
   snapshot en localStorage. Quien escribe con `commitState` publica
   un evento `gamert:state-changed` para que el AppContext se
   rehidrate; el AppContext persiste con `saveState` (sin evento),
   de modo que no hay bucles.
   ============================================================ */

export const STORAGE_KEY = "gamert:state:v2";
export const STATE_CHANGED_EVENT = "gamert:state-changed";
export const START_BALANCE = 250;

export interface Settings {
  profilePrivate: boolean;
  securityAndPassword: boolean;
  sounds: boolean;
  language: boolean;
  pushNotifications: boolean;
}

export const defaultSettings: Settings = {
  profilePrivate: false,
  securityAndPassword: false,
  sounds: false,
  language: false,
  pushNotifications: true,
};

export interface DemoState {
  authenticated: boolean;
  balance: number;
  tournaments: Tournament[];
  brackets: Record<string, Match[]>;
  registrations: Record<string, string[]>;
  notifications: AppNotification[];
  wallet: WalletMovement[];
  settings: Settings;
  eloOverrides: Record<string, EloRecord>;
}

const LIVE_SEEDS = ["u1", "u2", "u6", "u9", "u3", "u11", "u4", "u10", "u5", "u8", "u7", "u12"];

export function seedBrackets(): Record<string, Match[]> {
  const matches = scheduleRounds("summer-cup-fifa26", LIVE_SEEDS, "2026-02-10T18:00:00");

  const played: Array<{ slot: number; scoreA: number; scoreB: number }> = [
    { slot: 1, scoreA: 3, scoreB: 1 },
    { slot: 3, scoreA: 2, scoreB: 2 },
    { slot: 5, scoreA: 0, scoreB: 2 },
    { slot: 7, scoreA: 4, scoreB: 0 },
  ];

  let current = matches;
  for (const p of played) {
    const src = current.find((m) => m.slot === p.slot);
    if (!src || isBye(src)) continue;
    const withScore = current.map((m) =>
      m.id === src.id
        ? {
            ...m,
            scoreA: p.scoreA,
            scoreB: p.scoreB,
            status: "confirmed" as const,
            reportedBy: m.a,
          }
        : m,
    );
    current = settleMatch(withScore, src.id);
  }

  return { "summer-cup-fifa26": current };
}

export function defaultState(): DemoState {
  return {
    authenticated: false,
    balance: START_BALANCE,
    tournaments: allTournaments(),
    brackets: seedBrackets(),
    registrations: { [CURRENT_USER_ID]: ["summer-cup-fifa26"] },
    notifications: [...seedNotifications],
    wallet: [...walletHistory],
    settings: { ...defaultSettings },
    eloOverrides: {},
  };
}

export function loadState(): DemoState {
  const base = defaultState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<DemoState>;
    return {
      ...base,
      ...saved,
      settings: { ...base.settings, ...(saved.settings ?? {}) },
    };
  } catch {
    return base;
  }
}

export function saveState(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* sin persistencia disponible: la app sigue funcionando en memoria */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin persistencia disponible */
  }
}

/** Lee, aplica la mutación, guarda y notifica el cambio. */
export function commitState(update: (state: DemoState) => DemoState): DemoState {
  const next = update(loadState());
  saveState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STATE_CHANGED_EVENT));
  }
  return next;
}

/** Suscribe cambios publicados por `commitState`. Devuelve el cleanup. */
export function onStateChanged(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STATE_CHANGED_EVENT, cb);
  return () => window.removeEventListener(STATE_CHANGED_EVENT, cb);
}

let seq = 0;

export function createNotification(
  n: Omit<AppNotification, "id" | "date" | "read">,
): AppNotification {
  seq += 1;
  return { ...n, id: `n-${Date.now()}-${seq}`, date: new Date().toISOString(), read: false };
}

/** ELO de un jugador: base (data/players) + overrides del estado vivo. */
export function eloRecord(state: DemoState, playerId: string, gameId: string): EloRecord {
  const base = baseElo(playerId, gameId as Parameters<typeof baseElo>[1]);
  const override = state.eloOverrides[`${playerId}:${gameId}`];
  return override ? { ...base, ...override } : base;
}
