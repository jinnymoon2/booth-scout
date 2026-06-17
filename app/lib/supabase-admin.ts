// Server-side Supabase client. Use this in API routes / server actions
// that need to bypass RLS (e.g. recording submissions). Falls back to
// the in-memory store if no service role key is configured.
import { createClient } from "@supabase/supabase-js";

export const isAdminConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const supabaseAdmin = isAdminConfigured()
  ? createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    )
  : null;
