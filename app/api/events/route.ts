import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  filterTechnologyEvents,
  type EventLike,
} from "@/app/lib/tech-event-filter";
import {
  getGlobalTechSourceCards,
  normalizeGlobalCountry,
} from "@/app/lib/global-tech-sources";

export const dynamic = "force-dynamic";

type RawEvent = EventLike & {
  id?: string | number;
  event_id?: string | number;
  start_date?: string | null;
  end_date?: string | null;
  date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  image_url?: string | null;
  source_kind?: string | null;
  result_type?: string | null;
  priority?: number | null;
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

function normalizeEvent(event: RawEvent) {
  const title = event.title || event.name || "Untitled event";
  const description = event.description || event.summary || "";
  const eventDate = event.start_date || event.date || null;

  return {
    id: String(event.id || event.event_id || `${title}-${eventDate || event.url || ""}`),
    title,
    description,
    category: event.category || "Technology",
    tags: event.tags || [],
    venue: event.venue || "",
    location: event.location || event.venue || "",
    country: normalizeGlobalCountry(event.country),
    start_date: event.start_date || event.date || null,
    end_date: event.end_date || null,
    date: eventDate,
    organizer: event.organizer || "",
    source: event.source || "",
    url: event.url || "",
    image_url: event.image_url || null,
    created_at: event.created_at || null,
    updated_at: event.updated_at || null,
    source_kind: event.source_kind || "event",
    result_type: event.result_type || "event",
    priority: event.priority ?? 50,
  };
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfDate(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

function isPastEvent(event: ReturnType<typeof normalizeEvent>): boolean {
  if (event.result_type === "source") {
    return false;
  }

  const today = startOfToday();

  const endDate = parseDate(event.end_date);
  const startDate = parseDate(event.start_date || event.date);

  const comparisonDate = endDate || startDate;

  if (!comparisonDate) {
    return false;
  }

  return endOfDate(comparisonDate) < today;
}

function isUpcomingOrUndatedEvent(event: ReturnType<typeof normalizeEvent>): boolean {
  return !isPastEvent(event);
}

function getEventTime(event: ReturnType<typeof normalizeEvent>): number {
  const raw = event.start_date || event.date || "";
  const time = new Date(raw).getTime();

  if (Number.isNaN(time)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return time;
}

function normalizeUrl(url?: string | null) {
  return (url || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function dedupeEvents<T extends ReturnType<typeof normalizeEvent>>(events: T[]): T[] {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const event of events) {
    const key = normalizeUrl(event.url) || event.title.toLowerCase().trim();

    if (seen.has(key)) continue;

    seen.add(key);
    output.push(event);
  }

  return output;
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const q = searchParams.get("q");
    const includeSources = searchParams.get("includeSources") !== "false";

    let events: ReturnType<typeof normalizeEvent>[] = [];

    if (supabase) {
      const { data, error } = await supabase.from("events").select("*");

      if (error) {
        return NextResponse.json(
          {
            events: [],
            error: error.message,
          },
          { status: 500 }
        );
      }

      events = filterTechnologyEvents((data || []) as RawEvent[])
        .map(normalizeEvent)
        .filter(isUpcomingOrUndatedEvent);
    }

    if (includeSources) {
      const sourceCards = getGlobalTechSourceCards(country).map((source) =>
        normalizeEvent(source as RawEvent)
      );

      events = [...events, ...sourceCards];
    }

    if (country && country !== "all") {
      const normalizedCountry = normalizeGlobalCountry(country);

      events = events.filter(
        (event) => normalizeGlobalCountry(event.country) === normalizedCountry
      );
    }

    if (q && q.trim()) {
      const query = q.toLowerCase().trim();

      events = events.filter((event) => {
        const searchable = [
          event.title,
          event.description,
          event.category,
          Array.isArray(event.tags) ? event.tags.join(" ") : event.tags,
          event.venue,
          event.location,
          event.country,
          event.organizer,
          event.source,
          event.source_kind,
          event.result_type,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    events = dedupeEvents(events);

    events.sort((a, b) => {
      const aIsSource = a.result_type === "source";
      const bIsSource = b.result_type === "source";

      if (aIsSource !== bIsSource) {
        return aIsSource ? 1 : -1;
      }

      const aTime = getEventTime(a);
      const bTime = getEventTime(b);

      if (aTime !== bTime) {
        return aTime - bTime;
      }

      return (b.priority || 0) - (a.priority || 0);
    });

    return NextResponse.json({
      events,
      count: events.length,
      filter: "technology-only, upcoming-only",
      sourceCoverage: includeSources
        ? "Global source registry enabled for Korea, Japan, and America"
        : "Database events only",
    });
  } catch (error) {
    return NextResponse.json(
      {
        events: [],
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
