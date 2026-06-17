"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[] | string;
  venue?: string;
  location?: string;
  country?: string;
  start_date?: string | null;
  end_date?: string | null;
  date?: string | null;
  organizer?: string;
  source?: string;
  url?: string;
  image_url?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Date TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function normalizeCountry(country?: string | null) {
  const raw = (country || "").trim();
  const lower = raw.toLowerCase();

  if (
    lower === "south korea" ||
    lower === "republic of korea" ||
    lower === "korea republic of" ||
    lower === "rok" ||
    raw === "대한민국" ||
    raw === "한국"
  ) {
    return "Korea";
  }

  if (lower === "korea") return "Korea";

  return raw || "Unknown";
}

function getEventDate(event: EventItem) {
  return event.start_date || event.date || null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/events", {
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load events.");
      }

      const normalizedEvents = (payload.events || []).map((event: EventItem) => ({
        ...event,
        country: normalizeCountry(event.country),
      }));

      setEvents(normalizedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const countries = useMemo(() => {
    const unique = new Set<string>();

    for (const event of events) {
      unique.add(normalizeCountry(event.country));
    }

    return Array.from(unique)
      .filter(Boolean)
      .sort((a, b) => {
        if (a === "Korea") return -1;
        if (b === "Korea") return 1;
        return a.localeCompare(b);
      });
  }, [events]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.filter((event) => {
      const eventCountry = normalizeCountry(event.country);

      if (country !== "all" && eventCountry !== country) {
        return false;
      }

      if (!q) return true;

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

      return searchable.includes(q);
    });
  }, [events, query, country]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            BoothScout
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Technology Events
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Browse technology, AI, software, cloud, cybersecurity, semiconductor,
            startup, and developer-related events. Non-technology exhibitions are
            filtered out automatically.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_160px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search AI, cloud, security, software..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="all">All countries</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadEvents}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>{filteredEvents.length} technology events shown</span>
            <span>•</span>
            <span>{events.length} tech events loaded from database</span>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
            Loading saved technology events...
          </div>
        ) : null}

        {!loading && filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
            No technology events found. This usually means the database has no
            tech-related events yet, or the current filter is too narrow.
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const date = getEventDate(event);
            const tags = Array.isArray(event.tags)
              ? event.tags
              : typeof event.tags === "string"
                ? event.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                : [];

            return (
              <article
                key={event.id}
                className="flex min-h-[260px] flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
              >
                <div className="mb-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {event.category || "Technology"}
                    </span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {normalizeCountry(event.country)}
                    </span>
                  </div>

                  <h2 className="line-clamp-3 text-xl font-bold leading-snug">
                    {event.title}
                  </h2>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">Date:</span>{" "}
                    {formatDate(date)}
                    {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
                  </p>

                  {event.location || event.venue ? (
                    <p>
                      <span className="text-slate-500">Location:</span>{" "}
                      {event.location || event.venue}
                    </p>
                  ) : null}

                  {event.organizer ? (
                    <p>
                      <span className="text-slate-500">Organizer:</span>{" "}
                      {event.organizer}
                    </p>
                  ) : null}
                </div>

                {event.description ? (
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-400">
                    {event.description}
                  </p>
                ) : null}

                {tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto pt-5">
                  {event.url ? (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-xl border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950"
                    >
                      View event
                    </a>
                  ) : (
                    <span className="text-sm text-slate-500">
                      No source link available
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
