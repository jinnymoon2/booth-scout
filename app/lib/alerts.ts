// Saved-filter alert store. In-memory by default; persisted via Supabase
// when configured. The shape matches a future `saved_filters` table.

import { isSupabaseConfigured } from "./data";
import type { EventFilters, SavedFilter } from "./types";

const memoryStore: SavedFilter[] = [];

function isSupa(): boolean {
  return isSupabaseConfigured();
}

export async function createSavedFilter(
  email: string,
  filters: EventFilters,
  name: string | null = null,
): Promise<SavedFilter> {
  const entry: SavedFilter = {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    name,
    filters,
    createdAt: new Date().toISOString(),
    active: true,
    lastSentAt: null,
  };
  if (isSupa()) {
    const { createClient } = await import("@supabase/supabase-js");
    const supa = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY as string,
    );
    const { error } = await supa.from("saved_filters").insert(entry);
    if (error) throw error;
  } else {
    memoryStore.push(entry);
  }
  return entry;
}

export async function listSavedFilters(): Promise<SavedFilter[]> {
  if (isSupa()) {
    const { createClient } = await import("@supabase/supabase-js");
    const supa = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY as string,
    );
    const { data, error } = await supa
      .from("saved_filters")
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SavedFilter[];
  }
  return [...memoryStore];
}
