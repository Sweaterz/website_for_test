import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleConfig } from "./config";

export function getSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceRoleConfig();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
