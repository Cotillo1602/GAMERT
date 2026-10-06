import { isSupabaseConfigured } from "./supabase-client";

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}
