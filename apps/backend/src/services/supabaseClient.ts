import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "../types/env";

let supabaseClient: SupabaseClient | null = null;

export function initializeSupabaseClient(env: Env): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  }

  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error("Supabase client が初期化されていません");
  }
  return supabaseClient;
}
