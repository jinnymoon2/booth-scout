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
  source_kind?: string;
  result_type?: "event" | "source" | string;
  priority?: number;
};

function formatDate(value?: string | null) {
  if (!value) return "Continuously updated";

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
    raw === "한국" ||
    lower === "korea"
  ) {
    return "Korea";
  }

  if (lower === "japan" || raw === "日本" || raw === "일본") {
    return "Japan";
  }

  if (
    lower === "america" ||
    lower === "usa" ||
    lower === "u.s." ||
    lower === "u.s.a." ||
    lower === "us" ||
    lower === "united states" ||
    lower === "united states of america" ||
    raw === "미국"
  ) {
    return "America";
  }

  return raw || "Unknown";
}

function getEventDate(event: EventItem) {
  return event.start_date || event.date || null;
}

function getResultBadge(event: EventItem) {
  if (event.result_type === "source") {
    if (event.source_kind === "venue") return "Venue Source";
    if (event.source_kind === "directory") return "Conference Directory";
    if (event.source_kind === "festival") return "Startup Festival";
    if (event.source_kind === "conference") return "Conference Source";
    return "Discovery Source";
  }

  return "Event";
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");

  async function loadEvents(nextCountry = country, nextQuery = query) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (nextCountry && nextCountry !== "all") {
        params.set("country", nextCountry);
      }

      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      }

      params.set("includeSources", "true");

      const response = await fetch(`/api/events?${params.toString()}`, {
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
    loadEvents("all", "");
  }, []);

  const countries = useMemo(() => {
    const unique = new Set<string>(["Korea", "Japan", "America"]);

    for (const event of events) {
      unique.add(normalizeCountry(event.country));
    }

    return Array.from(unique)
      .filter(Boolean)
      .sort((a, b) => {
        const order = ["Korea", "Japan", "America"];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);

        if (aIndex !== -1 || bIndex !== -1) {
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        }

        return a.localeCompare(b);
      });
  }, [events]);

  const eventCount = events.filter((event) => event.result_type !== "source").length;
  const sourceCount = events.filter((event) => event.result_type === "source").length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            BoothScout
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Global Technology Event Scout
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            Browse technology-event sources across Korea, Japan, and America.
            BoothScout combines saved tech events with curated source coverage
            for AI, software, startup, developer, cloud, security, robotics,
            hardware, and enterprise technology events.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_170px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") loadEvents();
              }}
              placeholder="Search AI, cloud, startup, Tokyo, San Francisco, KINTEX..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <select
              value={country}
              onChange={(event) => {
                const nextCountry = event.target.value;
                setCountry(nextCountry);
                loadEvents(nextCountry, query);
              }}
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
              onClick={() => loadEvents()}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search sources"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="block text-lg font-bold text-white">
                {events.length}
              </span>
              total results
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="block text-lg font-bold text-white">
                {eventCount}
              </span>
              saved event cards
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="block text-lg font-bold text-white">
                {sourceCount}
              </span>
              discovery sources
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-5 text-sm leading-6 text-cyan-100">
          <strong className="text-cyan-300">Coverage:</strong>{" "}
          Korea includes COEX, KINTEX, SETEC, BEXCO, EXCO, AI EXPO KOREA,
          Smart Tech Korea, NextRise, and Try Everything. Japan includes Tokyo
          Big Sight, Makuhari Messe, SusHi Tech Tokyo, Manufacturing World Tokyo,
          and developer/AI conference directories. America includes
          WeAreDevelopers North America, The AI Conference, Startup Grind,
          NVIDIA GTC, CES, and developer conference directories.
        </section>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-900 bg-red-950/40 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
            Searching saved events and global technology-event sources...
          </div>
        ) : null}

        {!loading && events.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
            No technology events or source matches found. Try AI, startup,
            developer, cloud, security, Tokyo, San Francisco, Korea, Japan, or
            America.
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const date = getEventDate(event);
            const tags = Array.isArray(event.tags)
              ? event.tags
              : typeof event.tags === "string"
                ? event.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                : [];

            const isSource = event.result_type === "source";

            return (
              <article
                key={event.id}
                className={`flex min-h-[280px] flex-col rounded-2xl border p-5 shadow-lg shadow-black/20 ${
                  isSource
                    ? "border-cyan-800 bg-cyan-950/20"
                    : "border-slate-800 bg-slate-900/70"
                }`}
              >
                <div className="mb-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isSource
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-cyan-400/10 text-cyan-300"
                      }`}
                    >
                      {getResultBadge(event)}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {normalizeCountry(event.country)}
                    </span>

                    {event.venue ? (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {event.venue}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="line-clamp-3 text-xl font-bold leading-snug">
                    {event.title}
                  </h2>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">
                      {isSource ? "Status:" : "Date:"}
                    </span>{" "}
                    {formatDate(date)}
                    {event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
                  </p>

                  {event.location || event.venue ? (
                    <p>
                      <span className="text-slate-500">Location:</span>{" "}
                      {event.location || event.venue}
                    </p>
                  ) : null}

                  {event.organizer || event.source ? (
                    <p>
                      <span className="text-slate-500">Source:</span>{" "}
                      {event.organizer || event.source}
                    </p>
                  ) : null}
                </div>

                {event.description ? (
                  <p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-400">
                    {event.description}
                  </p>
                ) : null}

                {tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 6).map((tag) => (
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
                      {isSource ? "Browse source" : "View event"}
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
