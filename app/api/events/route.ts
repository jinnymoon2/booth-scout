import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  filterTechnologyEvents,
  normalizeCountry,
  type EventLike,
} from "@/app/lib/tech-event-filter";

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
  const eventDate = event.start_date || event.date || event.created_at || null;

  return {
    id: String(event.id || event.event_id || `${title}-${eventDate || ""}`),
    title,
    description,
    category: event.category || "Technology",
    tags: event.tags || [],
    venue: event.venue || "",
    location: event.location || event.venue || "",
    country: normalizeCountry(event.country),
    start_date: event.start_date || event.date || null,
    end_date: event.end_date || null,
    date: eventDate,
    organizer: event.organizer || "",
    source: event.source || "",
    url: event.url || "",
    image_url: event.image_url || null,
    created_at: event.created_at || null,
    updated_at: event.updated_at || null,
  };
}

function getEventTime(event: ReturnType<typeof normalizeEvent>): number {
  const raw = event.start_date || event.date || event.created_at || "";
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          events: [],
          error:
            "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const q = searchParams.get("q");

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

    let events = filterTechnologyEvents((data || []) as RawEvent[]).map(normalizeEvent);

    if (country && country !== "all") {
      const normalizedCountry = normalizeCountry(country);
      events = events.filter(
        (event) => normalizeCountry(event.country) === normalizedCountry
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
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    events.sort((a, b) => getEventTime(a) - getEventTime(b));

    return NextResponse.json({
      events,
      count: events.length,
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
