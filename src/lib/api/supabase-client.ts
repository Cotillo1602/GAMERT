import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!client) {
    if (!url || !anon) {
      throw new Error(
        "Supabase no configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY o activa modo demo.",
      );
    }
    client = createClient<Database>(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
      global: { headers: { "x-gamert-client": "web-v1.0.0" } },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon);
}
