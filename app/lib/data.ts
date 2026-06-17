import { SEED_EVENTS } from "./seed-data";
import type {
  BoothEvent,
  EventFilters,
  EventSubmission,
  Region,
  Audience,
  BoothStatus,
  EventFormat,
  CostBand,
} from "./types";
import { costBandCeiling } from "./types";

// ------------------------------------------------------------
// Supabase wiring (optional)
// ------------------------------------------------------------
// When SUPABASE_URL and SUPABASE_ANON_KEY are present, the data layer
// reads from the `booth_events` table. Otherwise it falls back to the
// in-memory seed dataset, so the directory is useful on day one.

export const isSupabaseConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

type SupabaseClientLike = {
  from: (table: string) => {
    select: (cols?: string) => any;
    insert: (row: any) => any;
    update: (row: any) => any;
  };
};

let _supabase: SupabaseClientLike | null = null;

async function getSupabase(): Promise<SupabaseClientLike | null> {
  if (!isSupabaseConfigured()) return null;
  if (_supabase) return _supabase;
  const { createClient } = await import("@supabase/supabase-js");
  _supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
  ) as unknown as SupabaseClientLike;
  return _supabase;
}

// ------------------------------------------------------------
// In-memory mutation store (used when Supabase is not configured)
// ------------------------------------------------------------
const memoryStore: { events: BoothEvent[]; submissions: EventSubmission[] } = {
  events: [...SEED_EVENTS],
  submissions: [],
};

// ------------------------------------------------------------
// Filtering
// ------------------------------------------------------------
function matchesFilters(event: BoothEvent, f: EventFilters): boolean {
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [
      event.name,
      event.organizer,
      event.city,
      event.country,
      event.venue,
      event.summary,
      ...event.highlights,
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.region?.length && !f.region.includes(event.region)) return false;
  if (f.format?.length && !f.format.includes(event.format)) return false;
  if (f.audience?.length && !event.audiences.some((a) => f.audience!.includes(a)))
    return false;
  if (f.status?.length && !f.status.includes(event.boothStatus)) return false;
  if (f.costMax) {
    const ceiling = costBandCeiling(f.costMax);
    if (ceiling == null) {
      // contact-only band chosen: only match events that are also contact-only
      if (event.costBand !== "contact") return false;
    } else if (event.costMaxUsd == null) {
      // Event with no listed USD ceiling - exclude
      return false;
    } else if (event.costMaxUsd > ceiling) {
      return false;
    }
  }
  if (f.startFrom && event.startDate < f.startFrom) return false;
  if (f.startTo && event.startDate > f.startTo) return false;
  return true;
}

function sortByFeaturedThenDate(a: BoothEvent, b: BoothEvent) {
  if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
  return a.startDate.localeCompare(b.startDate);
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------
export async function listEvents(filters: EventFilters = {}): Promise<BoothEvent[]> {
  const supabase = await getSupabase();
  let events: BoothEvent[];
  if (supabase) {
    const { data, error } = await supabase.from("booth_events").select("*");
    if (error) throw error;
    events = (data ?? []) as BoothEvent[];
  } else {
    events = memoryStore.events;
  }
  return events
    .filter((e) => matchesFilters(e, filters))
    .sort(sortByFeaturedThenDate);
}

export async function getEventBySlug(slug: string): Promise<BoothEvent | null> {
  const supabase = await getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("booth_events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as BoothEvent) ?? null;
  }
  return memoryStore.events.find((e) => e.slug === slug) ?? null;
}

export async function listRegions(): Promise<Region[]> {
  return ["us", "japan", "korea", "europe", "global"];
}

export async function listFormats(): Promise<EventFormat[]> {
  return ["expo", "conference", "meetup", "hybrid"];
}

export async function listAudiences(): Promise<Audience[]> {
  return ["developers", "infra", "ai_ml", "devrel", "marketers", "founders", "mixed"];
}

export async function listStatuses(): Promise<BoothStatus[]> {
  return ["open", "waitlist", "sold_out", "closed", "unknown"];
}

export async function listCostBands(): Promise<CostBand[]> {
  return ["free", "under_2k", "2k_to_5k", "5k_to_15k", "15k_to_50k", "50k_plus", "contact"];
}

// ------------------------------------------------------------
// Submissions
// ------------------------------------------------------------
export async function recordSubmission(
  input: Omit<EventSubmission, "id" | "status" | "submittedAt">,
): Promise<EventSubmission> {
  const submission: EventSubmission = {
    ...input,
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  const supabase = await getSupabase();
  if (supabase) {
    const { error } = await supabase.from("event_submissions").insert(submission);
    if (error) throw error;
  } else {
    memoryStore.submissions.push(submission);
  }
  return submission;
}

export async function listSubmissions(): Promise<EventSubmission[]> {
  const supabase = await getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("event_submissions")
      .select("*")
      .order("submittedAt", { ascending: false });
    if (error) throw error;
    return (data ?? []) as EventSubmission[];
  }
  return [...memoryStore.submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
}

// ------------------------------------------------------------
// Query-string helpers
// ------------------------------------------------------------
export function parseFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): EventFilters {
  const multi = (k: string): string[] | undefined => {
    const v = sp[k];
    if (!v) return undefined;
    return Array.isArray(v) ? v : v.split(",").filter(Boolean);
  };
  const single = (k: string): string | undefined => {
    const v = sp[k];
    if (!v || Array.isArray(v)) return undefined;
    return v;
  };
  return {
    q: single("q"),
    region: multi("region") as Region[] | undefined,
    format: multi("format") as EventFormat[] | undefined,
    audience: multi("audience") as Audience[] | undefined,
    status: multi("status") as BoothStatus[] | undefined,
    costMax: single("costMax") as CostBand | undefined,
    startFrom: single("startFrom"),
    startTo: single("startTo"),
  };
}
