import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  canReport as matchCanReport,
  isBye,
  podiumOf,
  scheduleRounds,
  seedRosterFor,
  settleMatch,
  standingsOf as buildStandings,
  tournamentFinished,
  type Match,
  type StandingRow,
} from "../lib/bracket";
import { rateMatch, type EloRecord } from "../lib/elo";
import type { GameId } from "../data/games";
import { CURRENT_USER_ID, eloOf as baseElo, getPlayer, playerName, players } from "../data/players";
import {
  allTournaments,
  isScheduledToday,
  rulesText,
  todayISO,
  type Prize,
  type Rules,
  type Tournament,
} from "../data/tournaments";
import {
  canPayCash,
  publishers,
  seedNotifications,
  walletHistory,
  type AppNotification,
  type PublisherAccount,
  type WalletMovement,
} from "../data/app";

/* ============================================================
   Estado global.

   Reparto de responsabilidades:
   - el organizador publica el torneo y declara reglas + premio;
   - la app siembra, arma el cuadro, asigna horarios, gestiona el
     resultado de cada partida, resuelve disputas y mueve el ELO.
   ============================================================ */

export interface Settings {
  profilePrivate: boolean;
  securityAndPassword: boolean;
  sounds: boolean;
  language: boolean;
  pushNotifications: boolean;
}

export interface CreateTournamentInput {
  name: string;
  gameId: GameId;
  modality: "Virtual" | "Presencial";
  format: Tournament["format"];
  date: string;
  time: string;
  slots: number;
  prize: Prize;
  rules: Rules;
}

export interface ReportResultInput {
  matchId: string;
  scoreA: number;
  scoreB: number;
  reportedBy: string;
}

export interface AppState {
  authenticated: boolean;
  userId: string;
  balance: number;

  tournaments: Tournament[];
  /** cuadros por id de torneo, materializados por la app */
  brackets: Record<string, Match[]>;
  /** inscripciones: userId -> tournamentIds */
  registrations: Record<string, string[]>;

  notifications: AppNotification[];
  wallet: WalletMovement[];
  settings: Settings;
  unreadCount: number;

  /* lecturas */
  myTournaments: Tournament[];
  todayTournaments: Tournament[];
  myOrganizedTournaments: Tournament[];

  /* acciones de jugador */
  signIn: () => void;
  signOut: () => void;
  joinTournament: (id: string) => void;
  leaveTournament: (id: string) => void;
  isJoined: (id: string) => boolean;
  reportResult: (input: ReportResultInput) => void;
  confirmResult: (matchId: string) => void;
  disputeResult: (matchId: string, reason: string) => void;
  resolveDispute: (matchId: string, winnerId: string) => void;
  forfeitMatch: (matchId: string) => void;

  /* lecturas por torneo (siempre contra el estado vivo) */
  tournamentById: (id: string) => Tournament | undefined;
  bracketOf: (id: string) => Match[];
  standingsOf: (id: string) => StandingRow[];

  /* gestión automática de la app */
  startTournament: (id: string) => void;

  /* acciones de organizador: solo crear y definir reglas/premio */
  createTournament: (input: CreateTournamentInput) => string;
  cancelTournament: (id: string) => void;
  canOrganizePrizes: () => boolean;

  /* ELO */
  eloOf: (userId: string, game: GameId) => EloRecord;
  eloDeltaFor: (matchId: string) => { winnerDelta: number; loserDelta: number } | null;
  rankingFor: (game: GameId) => { playerId: string; elo: EloRecord }[];

  /* notificaciones y billetera */
  markAllRead: () => void;
  updateSetting: (key: keyof Settings, value: boolean) => void;
  addFunds: (amount: number) => void;
  reset: () => void;
}

const Ctx = createContext<AppState | null>(null);

export const defaultSettings: Settings = {
  profilePrivate: false,
  securityAndPassword: false,
  sounds: false,
  language: false,
  pushNotifications: true,
};

const START_BALANCE = 250;
const STORAGE_KEY = "gamert:state:v2";

/* ---------- estado inicial: el torneo que ya está en vivo ---------- */

const LIVE_SEEDS = ["u1", "u2", "u6", "u9", "u3", "u11", "u4", "u10", "u5", "u8", "u7", "u12"];

function seedBrackets(): Record<string, Match[]> {
  const matches = scheduleRounds("summer-cup-fifa26", LIVE_SEEDS, "2026-02-10T18:00:00");

  // con 12 jugadores en un cuadro de 16, las cruces reales son los slots 1, 3, 5 y 7
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

/** Momento de inicio de un torneo, interpretado en la hora local del dispositivo. */
function startsAtOf(t: Tournament): Date {
  return new Date(`${t.date}T${t.time}:00`);
}

/* ---------- persistencia ---------- */

interface Persisted {
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

function loadPersisted(): Partial<Persisted> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(() => loadPersisted(), []);

  const [authenticated, setAuthenticated] = useState(persisted.authenticated ?? false);
  const [balance, setBalance] = useState(persisted.balance ?? START_BALANCE);
  const [tournaments, setTournaments] = useState<Tournament[]>(
    persisted.tournaments ?? allTournaments(),
  );
  const [brackets, setBrackets] = useState<Record<string, Match[]>>(
    persisted.brackets ?? seedBrackets(),
  );
  const [registrations, setRegistrations] = useState<Record<string, string[]>>(
    persisted.registrations ?? { [CURRENT_USER_ID]: ["summer-cup-fifa26"] },
  );
  const [items, setItems] = useState<AppNotification[]>(
    persisted.notifications ?? seedNotifications,
  );
  const [wallet, setWallet] = useState<WalletMovement[]>(persisted.wallet ?? walletHistory);
  const [settings, setSettings] = useState<Settings>(persisted.settings ?? defaultSettings);
  const [eloOverrides, setEloOverrides] = useState<Record<string, EloRecord>>(
    persisted.eloOverrides ?? {},
  );

  useEffect(() => {
    const snapshot: Persisted = {
      authenticated,
      balance,
      tournaments,
      brackets,
      registrations,
      notifications: items,
      wallet,
      settings,
      eloOverrides,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* sin persistencia disponible: la app sigue funcionando en memoria */
    }
  }, [
    authenticated,
    balance,
    tournaments,
    brackets,
    registrations,
    items,
    wallet,
    settings,
    eloOverrides,
  ]);

  /* ---------------- helpers ---------------- */

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "date" | "read">) => {
    setItems((prev) => [
      {
        ...n,
        id: `n-${Date.now()}-${Math.round(performance.now())}`,
        date: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const addWallet = useCallback((m: Omit<WalletMovement, "id" | "date" | "success">) => {
    setWallet((prev) => [
      { ...m, id: `w-${Date.now()}`, date: todayISO(), success: true },
      ...prev,
    ]);
  }, []);

  const patchElo = useCallback((playerId: string, game: GameId, record: EloRecord) => {
    setEloOverrides((prev) => ({ ...prev, [`${playerId}:${game}`]: record }));
  }, []);

  const tournamentById = useCallback(
    (id: string) => tournaments.find((t) => t.id === id),
    [tournaments],
  );
  const bracketOf = useCallback((id: string) => brackets[id] ?? [], [brackets]);

  /* ---------------- auth ---------------- */

  const signIn = useCallback(() => setAuthenticated(true), []);
  const signOut = useCallback(() => setAuthenticated(false), []);

  /* ---------------- ELO ---------------- */

  const eloOfFn = useCallback(
    (userId: string, game: GameId): EloRecord => {
      const base = baseElo(userId, game);
      const override = eloOverrides[`${userId}:${game}`];
      return override ? { ...base, ...override } : base;
    },
    [eloOverrides],
  );

  const rankingFor = useCallback(
    (game: GameId) =>
      players
        .filter((p) => p.id === CURRENT_USER_ID || p.elo[game] !== undefined)
        .map((p) => ({ playerId: p.id, elo: eloOfFn(p.id, game) }))
        .sort((a, b) => b.elo.rating - a.elo.rating || b.elo.wins - a.elo.wins),
    [eloOfFn],
  );

  /* ---------------- inscripción ---------------- */

  const joinTournament = useCallback(
    (id: string) => {
      const t = tournaments.find((x) => x.id === id);
      if (!t || t.enrolled >= t.slots) return;

      setRegistrations((prev) => {
        const list = prev[CURRENT_USER_ID] ?? [];
        if (list.includes(id)) return prev;
        return { ...prev, [CURRENT_USER_ID]: [...list, id] };
      });
      setTournaments((prev) =>
        prev.map((x) => (x.id === id ? { ...x, enrolled: x.enrolled + 1 } : x)),
      );

      pushNotification({
        title: `Inscripción confirmada en ${t.name}`,
        body: "La app te siembra por ELO cuando llegue el inicio.",
        kind: "torneo",
        gameId: t.gameId,
      });
    },
    [tournaments, pushNotification],
  );

  const leaveTournament = useCallback((id: string) => {
    setRegistrations((prev) => ({
      ...prev,
      [CURRENT_USER_ID]: (prev[CURRENT_USER_ID] ?? []).filter((x) => x !== id),
    }));
    setTournaments((prev) =>
      prev.map((x) => (x.id === id && x.enrolled > 0 ? { ...x, enrolled: x.enrolled - 1 } : x)),
    );
  }, []);

  const isJoined = useCallback(
    (id: string) => (registrations[CURRENT_USER_ID] ?? []).includes(id),
    [registrations],
  );

  /* ---------------- gestión automática del torneo ---------------- */

  /** Siembra por ELO y publica el cuadro. El organizador no interviene. */
  const startTournament = useCallback(
    (id: string) => {
      const t = tournaments.find((x) => x.id === id);
      if (!t || brackets[id]) return;

      const seeds = seedRosterFor(t, registrations, eloOfFn);
      if (seeds.length < 2) return;

      const startsAt = startsAtOf(t);
      const matches = scheduleRounds(t.id, seeds, startsAt.toString());

      setBrackets((prev) => ({ ...prev, [t.id]: matches }));
      setTournaments((prev) =>
        prev.map((x) =>
          x.id === t.id ? { ...x, status: "live", phase: matches[0]?.roundLabel ?? "RONDA 1" } : x,
        ),
      );
      pushNotification({
        title: `${t.name} arrancó`,
        body: `La app generó el cuadro: ${seeds.length} participantes sembrados por ELO.`,
        kind: "torneo",
        gameId: t.gameId,
      });
    },
    [tournaments, brackets, registrations, eloOfFn, pushNotification],
  );

  /* La app opera sola: cuando llega la hora de un torneo en el que estoy
     inscripto, siembra el cuadro por ELO y lo deja listo para jugar.
     Se difiere un tick para no encadenar renders dentro del effect. */
  useEffect(() => {
    if (!authenticated) return;
    const mine = registrations[CURRENT_USER_ID] ?? [];
    const now = Date.now();
    const due = tournaments.filter((t) => {
      if (t.status !== "upcoming" || brackets[t.id] || !mine.includes(t.id)) return false;
      const at = startsAtOf(t).getTime();
      return !Number.isNaN(at) && at <= now;
    });
    if (due.length === 0) return;
    const timer = setTimeout(() => {
      for (const t of due) startTournament(t.id);
    }, 0);
    return () => clearTimeout(timer);
  }, [authenticated, tournaments, brackets, registrations, startTournament]);

  /**
   * Cierra una partida: confirma, propaga el ganador, mueve el ELO
   * y, si el torneo terminó, reparte el premio declarado.
   */
  const commit = useCallback(
    (tid: string, match: Match, next: Match[]) => {
      setBrackets((prev) => ({ ...prev, [tid]: next }));

      const t = tournaments.find((x) => x.id === tid);
      if (!t) return;

      /* ELO por juego */
      if (match.a && match.b) {
        const { a, b, updates } = rateMatch(
          eloOfFn(match.a, t.gameId),
          eloOfFn(match.b, t.gameId),
          match.scoreA ?? 0,
          match.scoreB ?? 0,
        );
        patchElo(match.a, t.gameId, a);
        patchElo(match.b, t.gameId, b);

        const iWon = match.a === CURRENT_USER_ID;
        const mine = iWon ? updates.winner : updates.loser;
        const opponent = iWon ? match.b : match.a;
        pushNotification({
          title: `Partida confirmada: ${mine.delta >= 0 ? "+" : ""}${mine.delta} ELO en ${t.gameId.toUpperCase()}`,
          body: iWon
            ? `Ganaste. Nuevo rating: ${mine.after}.`
            : `Perdiste contra ${playerName(opponent ?? "")}. Nuevo rating: ${mine.after}.`,
          kind: "elo",
          gameId: t.gameId,
        });
      }

      if (tournamentFinished(next)) {
        const [first, second, third] = podiumOf(next);

        const share = (playerId: string | null, pct: number) => {
          if (!playerId || pct <= 0 || t.prize.amount <= 0) return;
          const amount = Math.round((t.prize.amount * pct) / 100);
          if (amount <= 0) return;
          if (playerId === CURRENT_USER_ID) {
            setBalance((b) => b + amount);
            addWallet({ kind: "PREMIO", amount, label: t.name });
          }
          pushNotification({
            title: `${playerName(playerId)} ganó ${t.prize.currency} ${amount} en ${t.name}`,
            body:
              playerId === CURRENT_USER_ID
                ? "El pago se acreditó a tu billetera."
                : `Reparto ${pct}% del premio declarado por el organizador.`,
            kind: "pago",
            gameId: t.gameId,
          });
        };

        share(first, t.prize.split[0]);
        share(second, t.prize.split[1]);
        share(third, t.prize.split[2]);
        setTournaments((prev) =>
          prev.map((x) => (x.id === tid ? { ...x, status: "finished" } : x)),
        );
      } else if (t.status === "upcoming") {
        setTournaments((prev) => prev.map((x) => (x.id === tid ? { ...x, status: "live" } : x)));
      }
    },
    [tournaments, eloOfFn, patchElo, pushNotification, addWallet],
  );

  const reportResult = useCallback(
    ({ matchId, scoreA, scoreB, reportedBy }: ReportResultInput) => {
      const tid = matchId.split(":m")[0];
      const list = brackets[tid];
      const match = list?.find((m) => m.id === matchId);
      if (!match || !matchCanReport(match, reportedBy)) return;

      const rules = tournaments.find((t) => t.id === tid)?.rules;
      const rival = match.a === reportedBy ? match.b : match.a;
      const needsConfirm = Boolean(rules?.requireConfirmation) && rival !== null;

      const reported: Match = {
        ...match,
        scoreA,
        scoreB,
        status: needsConfirm ? "reported" : "confirmed",
        reportedBy,
        needsConfirmation: needsConfirm,
        disputed: false,
        reportReason: undefined,
      };
      const next = list.map((m) => (m.id === matchId ? reported : m));

      if (!needsConfirm) {
        commit(tid, reported, settleMatch(next, matchId));
        return;
      }

      setBrackets((prev) => ({ ...prev, [tid]: next }));
      pushNotification({
        title: "Resultado reportado — falta confirmación",
        body: `${playerName(rival ?? "")} tiene ${rules?.disputeWindowMin ?? 24}h para confirmar o impugnar.`,
        kind: "torneo",
      });
    },
    [brackets, tournaments, commit, pushNotification],
  );

  const confirmResult = useCallback(
    (matchId: string) => {
      const tid = matchId.split(":m")[0];
      const list = brackets[tid];
      const match = list?.find((m) => m.id === matchId);
      if (!match || isBye(match) || match.scoreA === null || match.scoreB === null) return;
      commit(tid, match, settleMatch(list, matchId));
    },
    [brackets, commit],
  );

  const disputeResult = useCallback(
    (matchId: string, reason: string) => {
      const tid = matchId.split(":m")[0];
      const match = brackets[tid]?.find((m) => m.id === matchId);
      if (!match || (match.a !== CURRENT_USER_ID && match.b !== CURRENT_USER_ID)) return;

      setBrackets((prev) => ({
        ...prev,
        [tid]: prev[tid].map((m) =>
          m.id === matchId
            ? { ...m, status: "disputed" as const, disputed: true, reportReason: reason }
            : m,
        ),
      }));
      pushNotification({
        title: "Resultado impugnado",
        body: "La app abrió el caso: el ELO queda congelado hasta resolver con las pruebas.",
        kind: "sistema",
      });
    },
    [brackets, pushNotification],
  );

  /**
   * Resuelve una disputa a favor de uno de los dos participantes: la app
   * reabre el marcador, mueve el ELO según el veredicto y cuenta la disputa
   * perdida para el organizador, que es lo que habilita premios en efectivo.
   */
  const resolveDispute = useCallback(
    (matchId: string, winnerId: string) => {
      const tid = matchId.split(":m")[0];
      const list = brackets[tid];
      const match = list?.find((m) => m.id === matchId);
      if (!match || (winnerId !== match.a && winnerId !== match.b)) return;

      const t = tournaments.find((x) => x.id === tid);
      const wins = Math.ceil((t?.rules.bestOf ?? 3) / 2);
      const aWins = winnerId === match.a;

      const resolved: Match = {
        ...match,
        scoreA: aWins ? wins : 0,
        scoreB: aWins ? 0 : wins,
        status: "confirmed",
        needsConfirmation: false,
        disputed: false,
        reportReason: `resuelto a favor de ${playerName(winnerId)}`,
      };

      commit(
        tid,
        resolved,
        settleMatch(
          list.map((m) => (m.id === matchId ? resolved : m)),
          matchId,
        ),
      );
      pushNotification({
        title: `Disputa resuelta en ${t?.name ?? "el torneo"}`,
        body: `Gana ${playerName(winnerId)}. El ELO de ${t?.gameId.toUpperCase() ?? "el juego"} se actualizó.`,
        kind: "sistema",
        gameId: t?.gameId,
      });
    },
    [brackets, tournaments, commit, pushNotification],
  );

  /** Timeout o desconexión: la app confirma a favor del rival. */
  const forfeitMatch = useCallback(
    (matchId: string) => {
      const tid = matchId.split(":m")[0];
      const list = brackets[tid];
      const match = list?.find((m) => m.id === matchId);
      if (!match || !match.a || !match.b) return;

      const rules = tournaments.find((t) => t.id === tid)?.rules;
      const wins = Math.ceil((rules?.bestOf ?? 3) / 2);
      const iForfeit = match.a === CURRENT_USER_ID;

      const settled: Match = {
        ...match,
        scoreA: iForfeit ? 0 : wins,
        scoreB: iForfeit ? wins : 0,
        status: "confirmed",
        needsConfirmation: false,
        reportReason: "forfeit",
      };
      commit(
        tid,
        settled,
        settleMatch(
          list.map((m) => (m.id === matchId ? settled : m)),
          matchId,
        ),
      );
    },
    [brackets, tournaments, commit],
  );

  const eloDeltaFor = useCallback(
    (matchId: string) => {
      const tid = matchId.split(":m")[0];
      const m = brackets[tid]?.find((x) => x.id === matchId);
      if (!m || m.scoreA === null || m.scoreB === null || !m.a || !m.b) return null;
      const t = tournaments.find((x) => x.id === tid);
      if (!t) return null;
      const { updates } = rateMatch(
        eloOfFn(m.a, t.gameId),
        eloOfFn(m.b, t.gameId),
        m.scoreA,
        m.scoreB,
      );
      return { winnerDelta: updates.winner.delta, loserDelta: updates.loser.delta };
    },
    [brackets, tournaments, eloOfFn],
  );

  const standingsFor = useCallback((id: string) => buildStandings(brackets[id] ?? []), [brackets]);

  /* ---------------- organizador ---------------- */

  const createTournament = useCallback(
    (input: CreateTournamentInput): string => {
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
      setTournaments((prev) => [t, ...prev]);
      setRegistrations((prev) => ({
        ...prev,
        [CURRENT_USER_ID]: [id, ...(prev[CURRENT_USER_ID] ?? [])],
      }));
      pushNotification({
        title: `Torneo publicado: ${t.name}`,
        body: "La app se encarga de la siembra, el cuadro, los horarios y los resultados.",
        kind: "torneo",
        gameId: t.gameId,
      });
      return id;
    },
    [pushNotification],
  );

  const cancelTournament = useCallback(
    (id: string) => {
      setTournaments((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "finished", enrolled: 0 } : x)),
      );
      setBrackets((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      pushNotification({
        title: "Torneo cancelado",
        body: "Los inscritos fueron notificados.",
        kind: "sistema",
      });
    },
    [pushNotification],
  );

  const canOrganizePrizes = useCallback(() => canPayCash(CURRENT_USER_ID), []);

  /* ---------------- derivadas ---------------- */

  const myOrganizedTournaments = useMemo(
    () => tournaments.filter((t) => t.organizerId === CURRENT_USER_ID),
    [tournaments],
  );

  const myTournaments = useMemo(() => {
    const mine = registrations[CURRENT_USER_ID] ?? [];
    return tournaments.filter((t) => mine.includes(t.id));
  }, [registrations, tournaments]);

  const todayTournaments = useMemo(
    () =>
      tournaments
        .filter((t) => isScheduledToday(t.date))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [tournaments],
  );

  /* ---------------- ajustes y billetera ---------------- */

  const markAllRead = useCallback(
    () => setItems((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  const updateSetting = useCallback(
    (key: keyof Settings, value: boolean) => setSettings((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const addFunds = useCallback(
    (amount: number) => {
      setBalance((b) => b + amount);
      addWallet({ kind: "RECARGA", amount });
    },
    [addWallet],
  );

  const reset = useCallback(() => {
    setAuthenticated(false);
    setBalance(START_BALANCE);
    setTournaments(allTournaments());
    setBrackets(seedBrackets());
    setRegistrations({ [CURRENT_USER_ID]: ["summer-cup-fifa26"] });
    setItems(seedNotifications);
    setWallet(walletHistory);
    setSettings(defaultSettings);
    setEloOverrides({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin persistencia disponible */
    }
  }, []);

  const value = useMemo<AppState>(
    () => ({
      authenticated,
      userId: CURRENT_USER_ID,
      balance,
      tournaments,
      brackets,
      registrations,
      notifications: items,
      wallet,
      settings,
      unreadCount: items.filter((n) => !n.read).length,
      myTournaments,
      todayTournaments,
      myOrganizedTournaments,
      signIn,
      signOut,
      joinTournament,
      leaveTournament,
      isJoined,
      reportResult,
      confirmResult,
      disputeResult,
      resolveDispute,
      forfeitMatch,
      tournamentById,
      bracketOf,
      standingsOf: standingsFor,
      startTournament,
      createTournament,
      cancelTournament,
      canOrganizePrizes,
      eloOf: eloOfFn,
      eloDeltaFor,
      rankingFor,
      markAllRead,
      updateSetting,
      addFunds,
      reset,
    }),
    [
      authenticated,
      balance,
      tournaments,
      brackets,
      registrations,
      items,
      wallet,
      settings,
      myTournaments,
      todayTournaments,
      myOrganizedTournaments,
      signIn,
      signOut,
      joinTournament,
      leaveTournament,
      isJoined,
      reportResult,
      confirmResult,
      disputeResult,
      resolveDispute,
      forfeitMatch,
      tournamentById,
      bracketOf,
      standingsFor,
      startTournament,
      createTournament,
      cancelTournament,
      canOrganizePrizes,
      eloOfFn,
      eloDeltaFor,
      rankingFor,
      markAllRead,
      updateSetting,
      addFunds,
      reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return v;
}

export { rulesText, getPlayer, publishers };
export type { PublisherAccount, Match, Tournament, GameId, Prize, Rules, StandingRow };
