import { isDemoMode } from "./utils";
import { getSupabaseClient } from "./supabase-client";
import { type AppError, toAppError } from "./errors";

export interface Session {
  userId: string;
  email: string;
  name?: string;
}

const DEMO_USER: Session = { userId: "u1", email: "demo@gamert.dev", name: "Demo" };

export async function signIn(_email: string, _password: string): Promise<Session> {
  if (isDemoMode()) return Promise.resolve(DEMO_USER);
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: _email,
      password: _password,
    });
    if (error) throw error;
    return { userId: data.user.id, email: data.user.email ?? _email };
  } catch (e) {
    throw toAppError(e as AppError);
  }
}

export async function signUp(_email: string, _password: string, _name: string): Promise<Session> {
  if (isDemoMode()) return Promise.resolve({ userId: "new", email: _email, name: _name });
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({ email: _email, password: _password });
    if (error) throw error;
    return { userId: data.user?.id ?? "new", email: _email, name: _name };
  } catch (e) {
    throw toAppError(e as AppError);
  }
}

export async function signOut(): Promise<void> {
  if (isDemoMode()) return Promise.resolve();
  try {
    const client = getSupabaseClient();
    await client.auth.signOut();
  } catch (e) {
    throw toAppError(e as AppError);
  }
}

export async function getSession(): Promise<Session | null> {
  if (isDemoMode()) return Promise.resolve(null);
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
