// Browser-side Supabase client. Only used if you want to add auth or
// RLS-protected reads later. Today the app reads events via the
// server data layer in app/lib/data.ts.
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
);
