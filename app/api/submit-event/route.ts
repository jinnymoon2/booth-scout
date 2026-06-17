import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isTechnologyEvent } from "@/app/lib/tech-event-filter";
import { normalizeGlobalCountry } from "@/app/lib/global-tech-sources";

export const dynamic = "force-dynamic";

type SubmitEventBody = {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[] | string;
  venue?: string;
  location?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  organizer?: string;
  source?: string;
  url?: string;
  image_url?: string;
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

function cleanString(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => cleanString(tag)).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeDate(value: unknown): string | null {
  const raw = cleanString(value);

  if (!raw) return null;

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toISOString();
}

function validateEvent(event: SubmitEventBody) {
  const title = cleanString(event.title);
  const url = cleanString(event.url);

  if (!title) {
    return "Event title is required.";
  }

  if (title.length < 3) {
    return "Event title is too short.";
  }

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    return "Event URL must start with http:// or https://.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitEventBody;
    const validationError = validateEvent(body);

    if (validationError) {
      return NextResponse.json(
        {
          ok: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    const eventToCheck = {
      title: cleanString(body.title),
      description: cleanString(body.description),
      category: cleanString(body.category),
      tags: normalizeTags(body.tags),
      venue: cleanString(body.venue),
      location: cleanString(body.location),
      country: normalizeGlobalCountry(body.country),
      organizer: cleanString(body.organizer),
      source: cleanString(body.source),
      url: cleanString(body.url),
    };

    if (!isTechnologyEvent(eventToCheck)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This event does not look technology-related enough to be added to BoothScout.",
        },
        { status: 400 }
      );
    }

    const eventRecord = {
      title: eventToCheck.title,
      description: eventToCheck.description,
      category: eventToCheck.category || "Technology",
      tags: eventToCheck.tags,
      venue: eventToCheck.venue,
      location: eventToCheck.location,
      country: eventToCheck.country,
      start_date: normalizeDate(body.start_date || body.date),
      end_date: normalizeDate(body.end_date),
      organizer: eventToCheck.organizer,
      source: eventToCheck.source || "User submitted",
      url: eventToCheck.url,
      image_url: cleanString(body.image_url) || null,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          ok: true,
          saved: false,
          message:
            "Event passed validation, but Supabase environment variables are missing. Add Supabase env vars to save submissions.",
          event: eventRecord,
        },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert(eventRecord)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      saved: true,
      event: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown submit-event error.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "submit-event route is active. Send a POST request with event details to submit a technology event.",
    required_fields: ["title"],
    optional_fields: [
      "description",
      "category",
      "tags",
      "venue",
      "location",
      "country",
      "start_date",
      "end_date",
      "organizer",
      "source",
      "url",
      "image_url",
    ],
  });
}
