import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Legacy anon JWT — the Realtime websocket endpoint on this project rejects
    // the modern publishable key (HTTP 401); only the anon JWT authorizes the
    // postgres_changes subscription. Equally safe for client bundles (public key).
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
