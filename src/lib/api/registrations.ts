import { isDemoMode } from "./utils";

export async function isJoined(_tournamentId: string, _userId: string): Promise<boolean> {
  if (isDemoMode()) return Promise.resolve(false);
  return Promise.resolve(false);
}

export async function participants(_tournamentId: string): Promise<string[]> {
  if (isDemoMode()) return Promise.resolve([]);
  return Promise.resolve([]);
}

export async function joinTournament(
  _tournamentId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode()) return Promise.resolve({ ok: true });
  return Promise.resolve({ ok: true });
}

export async function leaveTournament(_tournamentId: string): Promise<{ ok: boolean }> {
  if (isDemoMode()) return Promise.resolve({ ok: true });
  return Promise.resolve({ ok: true });
}
