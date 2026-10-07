import {
  canReport as matchCanReport,
  isBye,
  podiumOf,
  nextMatchFor as findNextMatch,
  settleMatch,
  tournamentFinished,
  type Match,
} from "../../lib/bracket";
import { rateMatch } from "../../lib/elo";
import type { AppNotification, WalletMovement } from "../../data/app";
import { CURRENT_USER_ID, playerName } from "../../data/players";
import { todayISO } from "../../data/tournaments";
import {
  commitState,
  createNotification,
  eloRecord,
  loadState,
  type DemoState,
} from "./demo-store";

export async function bracketOf(tournamentId: string): Promise<Match[]> {
  return [...(loadState().brackets[tournamentId] ?? [])].sort((a, b) => a.slot - b.slot);
}

export async function nextMatchFor(matches: Match[], playerId: string): Promise<Match | undefined> {
  return findNextMatch(matches, playerId);
}

/* ============================================================
   Ciclo de una partida (demo con RPC): reportar → confirmar /
   impugnar → resolver. Todo se commitea al demo-store y el
   AppContext se rehidrata con `gamert:state-changed`.
   ============================================================ */

export interface ReportResultInput {
  matchId: string;
  scoreA: number;
  scoreB: number;
  reportedBy: string;
}

function tidOf(matchId: string): string {
  return matchId.split(":m")[0];
}

type NotificationDraft = Omit<AppNotification, "id" | "date" | "read">;

/**
 * Confirma una partida sellada: propaga el ganador al cuadro, mueve el ELO
 * por juego, reparte el premio si el torneo terminó y avisa.
 */
function settleAndRate(state: DemoState, tid: string, match: Match) {
  const brackets = {
    ...state.brackets,
    [tid]: settleMatch(
      (state.brackets[tid] ?? []).map((m) => (m.id === match.id ? match : m)),
      match.id,
    ),
  };
  const t = state.tournaments.find((x) => x.id === tid);
  if (!t) return { ...state, brackets };

  const eloOverrides = { ...state.eloOverrides };
  const notifications = [...state.notifications];
  let balance = state.balance;
  const wallet = [...state.wallet];
  const push = (n: NotificationDraft) => notifications.unshift(createNotification(n));

  if (match.a && match.b) {
    const result = rateMatch(
      eloRecord(state, match.a, t.gameId),
      eloRecord(state, match.b, t.gameId),
      match.scoreA ?? 0,
      match.scoreB ?? 0,
    );
    eloOverrides[`${match.a}:${t.gameId}`] = result.a;
    eloOverrides[`${match.b}:${t.gameId}`] = result.b;

    const iWon = match.a === CURRENT_USER_ID;
    const mine = iWon ? result.updates.winner : result.updates.loser;
    const opponent = iWon ? match.b : match.a;
    push({
      title: `Partida confirmada: ${mine.delta >= 0 ? "+" : ""}${mine.delta} ELO en ${t.gameId.toUpperCase()}`,
      body: iWon
        ? `Ganaste. Nuevo rating: ${mine.after}.`
        : `Perdiste contra ${playerName(opponent ?? "")}. Nuevo rating: ${mine.after}.`,
      kind: "elo",
      gameId: t.gameId,
    });
  }

  let tournaments = state.tournaments;
  if (tournamentFinished(brackets[tid])) {
    const [first, second, third] = podiumOf(brackets[tid]);
    const share = (playerId: string | null, pct: number) => {
      if (!playerId || pct <= 0 || t.prize.amount <= 0) return;
      const amount = Math.round((t.prize.amount * pct) / 100);
      if (amount <= 0) return;
      if (playerId === CURRENT_USER_ID) {
        balance += amount;
        wallet.unshift({
          id: `w-${Date.now()}`,
          date: todayISO(),
          success: true,
          kind: "PREMIO",
          amount,
          label: t.name,
        } satisfies WalletMovement);
      }
      push({
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
    tournaments = tournaments.map((x) => (x.id === tid ? { ...x, status: "finished" } : x));
  } else {
    tournaments = tournaments.map((x) =>
      x.id === tid && x.status === "upcoming" ? { ...x, status: "live" } : x,
    );
  }

  return { ...state, brackets, eloOverrides, tournaments, notifications, balance, wallet };
}

export async function reportResult(input: ReportResultInput): Promise<void> {
  const tid = tidOf(input.matchId);
  const match = loadState().brackets[tid]?.find((m) => m.id === input.matchId);
  if (!match || !matchCanReport(match, input.reportedBy)) return;
  if (isBye(match)) return;

  const rules = loadState().tournaments.find((t) => t.id === tid)?.rules;
  const rival = match.a === input.reportedBy ? match.b : match.a;
  const needsConfirm = Boolean(rules?.requireConfirmation) && rival !== null;

  const reported: Match = {
    ...match,
    scoreA: input.scoreA,
    scoreB: input.scoreB,
    status: needsConfirm ? "reported" : "confirmed",
    reportedBy: input.reportedBy,
    needsConfirmation: needsConfirm,
    disputed: false,
    reportReason: undefined,
  };

  commitState((state) => {
    if (!needsConfirm) {
      return settleAndRate(state, tid, reported);
    }
    return {
      ...state,
      brackets: {
        ...state.brackets,
        [tid]: (state.brackets[tid] ?? []).map((m) => (m.id === input.matchId ? reported : m)),
      },
      notifications: [
        createNotification({
          title: "Resultado reportado — falta confirmación",
          body: `${playerName(rival ?? "")} tiene ${rules?.disputeWindowMin ?? 24}h para confirmar o impugnar.`,
          kind: "torneo",
        }),
        ...state.notifications,
      ],
    };
  });
}

export async function confirmResult(matchId: string): Promise<void> {
  const tid = tidOf(matchId);
  const match = loadState().brackets[tid]?.find((m) => m.id === matchId);
  if (!match || isBye(match) || match.scoreA === null || match.scoreB === null) return;
  commitState((state) => settleAndRate(state, tid, match));
}

export async function disputeResult(matchId: string, reason: string): Promise<void> {
  const tid = tidOf(matchId);
  const match = loadState().brackets[tid]?.find((m) => m.id === matchId);
  if (!match || (match.a !== CURRENT_USER_ID && match.b !== CURRENT_USER_ID)) return;

  commitState((state) => ({
    ...state,
    brackets: {
      ...state.brackets,
      [tid]: (state.brackets[tid] ?? []).map((m) =>
        m.id === matchId
          ? { ...m, status: "disputed" as const, disputed: true, reportReason: reason }
          : m,
      ),
    },
    notifications: [
      createNotification({
        title: "Resultado impugnado",
        body: "La app abrió el caso: el ELO queda congelado hasta resolver con las pruebas.",
        kind: "sistema",
      }),
      ...state.notifications,
    ],
  }));
}

export async function resolveDispute(matchId: string, winnerId: string): Promise<void> {
  const tid = tidOf(matchId);
  const match = loadState().brackets[tid]?.find((m) => m.id === matchId);
  if (!match || (winnerId !== match.a && winnerId !== match.b)) return;

  commitState((state) => {
    const t = state.tournaments.find((x) => x.id === tid);
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

    const next = settleAndRate(state, tid, resolved);
    return {
      ...next,
      notifications: [
        createNotification({
          title: `Disputa resuelta en ${t?.name ?? "el torneo"}`,
          body: `Gana ${playerName(winnerId)}. El ELO de ${t?.gameId.toUpperCase() ?? "el juego"} se actualizó.`,
          kind: "sistema",
          gameId: t?.gameId,
        }),
        ...next.notifications,
      ],
    };
  });
}

/** Delta de ELO estimado de una partida confirmada (lectura, sin mutar). */
export function eloDeltaFor(matchId: string): { winnerDelta: number; loserDelta: number } | null {
  const tid = tidOf(matchId);
  const state = loadState();
  const m = state.brackets[tid]?.find((x) => x.id === matchId);
  if (!m || m.scoreA === null || m.scoreB === null || !m.a || !m.b) return null;
  const t = state.tournaments.find((x) => x.id === tid);
  if (!t) return null;
  const { updates } = rateMatch(
    eloRecord(state, m.a, t.gameId),
    eloRecord(state, m.b, t.gameId),
    m.scoreA,
    m.scoreB,
  );
  return { winnerDelta: updates.winner.delta, loserDelta: updates.loser.delta };
}
