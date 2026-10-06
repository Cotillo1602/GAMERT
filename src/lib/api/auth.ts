import { CURRENT_USER_ID } from "../../data/players";
import { commitState, loadState } from "./demo-store";
import { isDemoMode } from "./utils";
import { getSupabaseClient } from "./supabase-client";
import { type AppError, toAppError } from "./errors";

export interface Session {
  userId: string;
  email: string;
  name?: string;
}

const DEMO_EMAIL = "demo@gamert.dev";
const DEMO_USER: Session = { userId: CURRENT_USER_ID, email: DEMO_EMAIL, name: "Demo" };

export async function signIn(email: string, password: string): Promise<Session> {
  if (isDemoMode()) {
    commitState((s) => ({ ...s, authenticated: true }));
    return { ...DEMO_USER };
  }
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { userId: data.user.id, email: data.user.email ?? email };
  } catch (e) {
    throw toAppError(e as AppError);
  }
}

export async function signUp(email: string, password: string, name: string): Promise<Session> {
  if (isDemoMode()) {
    commitState((s) => ({ ...s, authenticated: true }));
    return { userId: CURRENT_USER_ID, email, name };
  }
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return { userId: data.user?.id ?? "new", email, name };
  } catch (e) {
    throw toAppError(e as AppError);
  }
}

export async function signOut(): Promise<void> {
  if (isDemoMode()) {
    commitState((s) => ({ ...s, authenticated: false }));
    return;
  }
  try {
    const client = getSupabaseClient();
    await client.auth.signOut();
  } catch (e) {
    throw toAppError(e as AppError);
  }
}

export async function getSession(): Promise<Session | null> {
  if (isDemoMode()) return loadState().authenticated ? { ...DEMO_USER } : null;
  try {
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();
    const u = data.session?.user;
    if (!u) return null;
    return {
      userId: u.id,
      email: u.email ?? "",
      name: (u.user_metadata?.name as string) ?? undefined,
    };
  } catch (e) {
    throw toAppError(e as AppError);
  }
}
