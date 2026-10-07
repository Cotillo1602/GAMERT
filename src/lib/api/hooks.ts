import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, signUp, type Session } from "./auth";
import type { Game } from "../../data/games";
import type { Player } from "../../data/players";
import { eloOf, eloPerGame, rankingFor } from "./elo";
import { publisherFor, listOrganizers } from "./orgs";
import { getGame, listGames } from "./games";
import { getProfile, listPlayers, searchPlayers } from "./players";
import { listMine, markAllRead, unreadCount } from "./notifications";
import { joinTournament, leaveTournament, isJoined, participants } from "./registrations";
import { getSettings, updateSetting, type SettingsPatch } from "./settings";
import { standingsOf } from "./standings";
import {
  bracketOf,
  confirmResult,
  disputeResult,
  reportResult,
  resolveDispute,
  type ReportResultInput,
} from "./matches";
import { queryKeys } from "./queryKeys";
import {
  cancelTournament,
  createTournament,
  getTournament,
  listMyTournaments,
  listOrganizedBy,
  listTournaments,
  type CreateTournamentInput,
  type TournamentFilter,
} from "./tournaments";

/* ---------- lecturas ---------- */

type Query<T> = ReturnType<typeof useQuery<T>>;

export function useGames(): Query<Game[]> {
  return useQuery({ queryKey: queryKeys.games(), queryFn: () => listGames() });
}

export function useGame(id: string): Query<Game | undefined> {
  return useQuery({
    queryKey: queryKeys.game(id),
    queryFn: () => getGame(id),
    enabled: Boolean(id),
  });
}

export function useAllPlayers(): Query<Player[]> {
  return useQuery({ queryKey: queryKeys.players(""), queryFn: () => listPlayers() });
}

export function usePlayers(query: string): Query<Player[]> {
  return useQuery({ queryKey: queryKeys.players(query), queryFn: () => searchPlayers(query) });
}

export function useProfile(id: string): Query<Player | undefined> {
  return useQuery({
    queryKey: queryKeys.profile(id),
    queryFn: () => getProfile(id),
    enabled: Boolean(id),
  });
}

type ListResult<T extends (...args: never[]) => unknown> = Query<Awaited<ReturnType<T>>>;

export function useTournaments(filter: TournamentFilter = {}): ListResult<typeof listTournaments> {
  return useQuery({
    queryKey: queryKeys.tournaments(filter),
    queryFn: () => listTournaments(filter),
  });
}

export function useTournament(id: string): ListResult<typeof getTournament> {
  return useQuery({
    queryKey: queryKeys.tournament(id),
    queryFn: () => getTournament(id),
    enabled: Boolean(id),
  });
}

export function useMyTournaments(userId: string): ListResult<typeof listMyTournaments> {
  return useQuery({
    queryKey: queryKeys.myTournaments(),
    queryFn: () => listMyTournaments(userId),
    enabled: Boolean(userId),
  });
}

export function useOrganizedBy(userId: string): ListResult<typeof listOrganizedBy> {
  return useQuery({
    queryKey: queryKeys.organizedBy(userId),
    queryFn: () => listOrganizedBy(userId),
    enabled: Boolean(userId),
  });
}

export function useParticipants(tournamentId: string): ListResult<typeof participants> {
  return useQuery({
    queryKey: queryKeys.participants(tournamentId),
    queryFn: () => participants(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useBracket(tournamentId: string): ListResult<typeof bracketOf> {
  return useQuery({
    queryKey: queryKeys.bracket(tournamentId),
    queryFn: () => bracketOf(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useStandings(tournamentId: string): ListResult<typeof standingsOf> {
  return useQuery({
    queryKey: queryKeys.standings(tournamentId),
    queryFn: () => standingsOf(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useRanking(gameId: string): ListResult<typeof rankingFor> {
  return useQuery({
    queryKey: queryKeys.ranking(gameId),
    queryFn: () => rankingFor(gameId),
    enabled: Boolean(gameId),
  });
}

export function useElo(playerId: string, gameId: string): Query<Awaited<ReturnType<typeof eloOf>>> {
  return useQuery({
    queryKey: queryKeys.elo(playerId, gameId),
    queryFn: () => eloOf(playerId, gameId),
    enabled: Boolean(playerId && gameId),
  });
}

export function useIsJoined(
  tournamentId: string,
  playerId: string,
): Query<Awaited<ReturnType<typeof isJoined>>> {
  return useQuery({
    queryKey: ["isJoined", tournamentId, playerId],
    queryFn: () => isJoined(tournamentId, playerId),
    enabled: Boolean(tournamentId && playerId),
  });
}

export function useEloPerGame(playerId: string): Query<Awaited<ReturnType<typeof eloPerGame>>> {
  return useQuery({
    queryKey: ["eloPerGame", playerId],
    queryFn: () => eloPerGame(playerId),
    enabled: Boolean(playerId),
  });
}

export function useOrganizers(): Query<Awaited<ReturnType<typeof listOrganizers>>> {
  return useQuery({ queryKey: ["organizers"], queryFn: () => listOrganizers() });
}

export function usePublisherFor(gameId: string): Query<Awaited<ReturnType<typeof publisherFor>>> {
  return useQuery({
    queryKey: ["publisher", gameId],
    queryFn: () => publisherFor(gameId),
    enabled: Boolean(gameId),
  });
}

export function useNotifications(): Query<Awaited<ReturnType<typeof listMine>>> {
  return useQuery({ queryKey: queryKeys.notifications(), queryFn: () => listMine() });
}

export function useUnreadCount(): Query<Awaited<ReturnType<typeof unreadCount>>> {
  return useQuery({ queryKey: queryKeys.unread(), queryFn: () => unreadCount() });
}

export function useSettings(): Query<Awaited<ReturnType<typeof getSettings>>> {
  return useQuery({ queryKey: queryKeys.settings(), queryFn: () => getSettings() });
}

/* ---------- mutaciones ---------- */

export interface JoinVariables {
  tournamentId: string;
  userId?: string;
}

export function useJoinTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, userId }: JoinVariables) => joinTournament(tournamentId, userId),
    onSuccess: (_res, { tournamentId }) => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
      qc.invalidateQueries({ queryKey: queryKeys.tournament(tournamentId) });
      qc.invalidateQueries({ queryKey: queryKeys.participants(tournamentId) });
      qc.invalidateQueries({ queryKey: ["isJoined"] });
    },
  });
}

export function useLeaveTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, userId }: JoinVariables) => leaveTournament(tournamentId, userId),
    onSuccess: (_res, { tournamentId }) => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
      qc.invalidateQueries({ queryKey: queryKeys.tournament(tournamentId) });
      qc.invalidateQueries({ queryKey: queryKeys.participants(tournamentId) });
      qc.invalidateQueries({ queryKey: ["isJoined"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread"] });
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) => updateSetting(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export interface Credentials {
  email: string;
  password: string;
  name?: string;
}

export function useSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: Credentials) => signIn(email, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSignUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, name }: Credentials) => signUp(email, password, name ?? ""),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.clear();
    },
  });
}

export type { Session };

export function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTournamentInput) => createTournament(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
      qc.invalidateQueries({ queryKey: ["organizedBy"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread"] });
    },
  });
}

export function useCancelTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelTournament(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["myTournaments"] });
      qc.invalidateQueries({ queryKey: ["organizedBy"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread"] });
    },
  });
}

function invalidateMatchQueries(
  qc: ReturnType<typeof useQueryClient>,
  tournamentId: string,
  movedElo = false,
) {
  qc.invalidateQueries({ queryKey: queryKeys.bracket(tournamentId) });
  qc.invalidateQueries({ queryKey: queryKeys.standings(tournamentId) });
  qc.invalidateQueries({ queryKey: queryKeys.tournament(tournamentId) });
  qc.invalidateQueries({ queryKey: ["tournaments"] });
  qc.invalidateQueries({ queryKey: ["myTournaments"] });
  qc.invalidateQueries({ queryKey: ["notifications"] });
  qc.invalidateQueries({ queryKey: ["unread"] });
  if (movedElo) {
    qc.invalidateQueries({ queryKey: ["ranking"] });
    qc.invalidateQueries({ queryKey: ["elo"] });
    qc.invalidateQueries({ queryKey: ["eloPerGame"] });
  }
}

export function useReportResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReportResultInput) => reportResult(input),
    onSuccess: (_res, input) => invalidateMatchQueries(qc, input.matchId.split(":m")[0], true),
  });
}

export function useConfirmResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => confirmResult(matchId),
    onSuccess: (_res, matchId) => invalidateMatchQueries(qc, matchId.split(":m")[0], true),
  });
}

export function useDisputeResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, reason }: { matchId: string; reason: string }) =>
      disputeResult(matchId, reason),
    onSuccess: (_res, { matchId }) => invalidateMatchQueries(qc, matchId.split(":m")[0]),
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, winnerId }: { matchId: string; winnerId: string }) =>
      resolveDispute(matchId, winnerId),
    onSuccess: (_res, { matchId }) => invalidateMatchQueries(qc, matchId.split(":m")[0], true),
  });
}
