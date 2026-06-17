"use client";

import { useEffect, useMemo, useState } from "react";
import { getTodayLabel, isUpcomingOrActive } from "../lib/date-utils";

type EventCard = {
  title: string;
  country: string;
  city?: string;
  venue?: string;
  sourceName: string;
  sourceUrl: string;
  url: string;
  description?: string;
  tags: string[];
  category?: string;
  resultType?: "curated" | "searched" | "scraped" | "manual";
  lastVerified?: string;
  startDate?: string;
  endDate?: string;
};

const COUNTRY_OPTIONS = ["All countries", "Korea", "Japan", "United States"];

const CATEGORY_OPTIONS = [
  "All categories",
  "Startup",
  "AI",
  "Developer",
  "Cloud",
  "Cybersecurity",
  "Hardware",
  "Mobility",
  "Smart City",
];

function formatDateRange(event: EventCard) {
  if (event.startDate && event.endDate && event.startDate !== event.endDate) {
    return `${event.startDate} - ${event.endDate}`;
  }

  return event.startDate || event.endDate || "Date not available";
}

function getLocation(event: EventCard) {
  return [event.venue, event.city].filter(Boolean).join(", ") || event.country;
}

function hasRealDate(event: EventCard) {
  return Boolean(event.startDate || event.endDate);
}

function dedupeEvents(events: EventCard[]) {
  const seen = new Set<string>();

  return events.filter((event) => {
    const key = [
      event.title,
      event.country,
      event.venue,
      event.startDate,
      event.endDate,
      event.sourceUrl,
    ]
      .filter(Boolean)
      .join("-")
      .toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function searchableText(event: EventCard) {
  return [
    event.title,
    event.country,
    event.city,
    event.venue,
    event.sourceName,
    event.description,
    event.category,
    ...(event.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesCategory(event: EventCard, category: string) {
  if (category === "All categories") return true;

  const text = searchableText(event);
  const normalized = category.toLowerCase();

  if (normalized === "startup") {
    return (
      text.includes("startup") ||
      text.includes("founder") ||
      text.includes("venture") ||
      text.includes("pitch") ||
      text.includes("vc")
    );
  }

  if (normalized === "developer") {
    return (
      text.includes("developer") ||
      text.includes("software") ||
      text.includes("programming") ||
      text.includes("api") ||
      text.includes("open source") ||
      text.includes("github")
    );
  }

  if (normalized === "cybersecurity") {
    return (
      text.includes("cybersecurity") ||
      text.includes("cyber security") ||
      text.includes("security") ||
      text.includes("infosec") ||
      text.includes("zero trust")
    );
  }

  if (normalized === "hardware") {
    return (
      text.includes("hardware") ||
      text.includes("electronics") ||
      text.includes("semiconductor") ||
      text.includes("robotics") ||
      text.includes("smart factory") ||
      text.includes("manufacturing")
    );
  }

  if (normalized === "smart city") {
    return (
      text.includes("smart city") ||
      text.includes("mobility") ||
      text.includes("iot") ||
      text.includes("urban") ||
      text.includes("infrastructure")
    );
  }

  return text.includes(normalized);
}

function isSearchedConference(event: EventCard) {
  return event.resultType === "searched";
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All countries");
  const [category, setCategory] = useState("All categories");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEvents() {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("query", query.trim());
      }

      if (country !== "All countries") {
        params.set("country", country);
      }

      params.set("limit", "500");

      const response = await fetch(`/api/events?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to load events.");
      }

      const rawEvents: EventCard[] = Array.isArray(data.events)
        ? data.events
        : [];

      const cleanEvents = dedupeEvents(
        rawEvents
          .filter((event): event is EventCard => Boolean(event))
          .filter(hasRealDate)
          .filter(isUpcomingOrActive)
      );

      setEvents(cleanEvents);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load events."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return events
      .filter(hasRealDate)
      .filter(isUpcomingOrActive)
      .filter((event) => {
        if (!normalizedQuery) return true;
        return searchableText(event).includes(normalizedQuery);
      })
      .filter((event) => {
        if (country === "All countries") return true;
        return event.country === country;
      })
      .filter((event) => matchesCategory(event, category));
  }, [events, query, country, category]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-300">
          BoothScout
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Global Technology Event Scout
        </h1>

        <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-300">
          Browse upcoming IT, startup, AI, developer, cloud, cybersecurity,
          hardware, robotics, and enterprise technology events. BoothScout
          automatically hides events that have already passed.
        </p>

        <p className="mt-3 text-sm text-slate-400">
          Today:{" "}
          <span className="font-semibold text-cyan-300">{getTodayLabel()}</span>
        </p>

        <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_170px_180px_150px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadEvents();
                }
              }}
              placeholder="Search AI, startup, cloud, developer, Korea, Japan..."
              className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
            />

            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-300"
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-300"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              onClick={loadEvents}
              disabled={isLoading}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Searching..." : "Search events"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 px-4 py-3">
              <p className="text-2xl font-black">{visibleEvents.length}</p>
              <p className="text-sm font-semibold text-slate-400">
                upcoming tech events
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 px-4 py-3">
              <p className="text-2xl font-black">
                {visibleEvents.filter((event) => isSearchedConference(event)).length}
              </p>
              <p className="text-sm font-semibold text-slate-400">
                searched conferences
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 px-4 py-3">
              <p className="text-2xl font-black">
                {visibleEvents.filter((event) => matchesCategory(event, "Startup")).length}
              </p>
              <p className="text-sm font-semibold text-slate-400">
                startup-related
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event, index) => (
            <article
              key={`${event.title}-${event.sourceUrl}-${event.startDate}-${index}`}
              className="flex min-h-[390px] flex-col rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
                  Event
                </span>

                {isSearchedConference(event) ? (
                  <span className="rounded-full bg-purple-400 px-3 py-1 text-xs font-black text-slate-950">
                    Searched conference
                  </span>
                ) : null}

                {event.category ? (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                    {event.category}
                  </span>
                ) : null}

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                  {event.country}
                </span>

                {event.venue ? (
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                    {event.venue}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 text-xl font-black leading-7 text-white">
                {event.title}
              </h2>

              <div className="mt-5 space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-semibold text-slate-500">Date:</span>{" "}
                  {formatDateRange(event)}
                </p>

                <p>
                  <span className="font-semibold text-slate-500">
                    Location:
                  </span>{" "}
                  {getLocation(event)}
                </p>

                <p>
                  <span className="font-semibold text-slate-500">
                    Event source:
                  </span>{" "}
                  {event.sourceName}
                </p>

                {event.lastVerified ? (
                  <p>
                    <span className="font-semibold text-slate-500">
                      Last verified:
                    </span>{" "}
                    {event.lastVerified}
                  </p>
                ) : null}
              </div>

              {event.description ? (
                <p className="mt-5 text-sm leading-6 text-slate-400">
                  {event.description}
                </p>
              ) : null}

              {event.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {event.tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="mt-auto pt-6 text-sm font-bold text-cyan-300 hover:text-cyan-200"
              >
                Open event website →
              </a>
            </article>
          ))}
        </div>

        {!isLoading && visibleEvents.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-black">
              No dated upcoming tech events found.
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Try searching with a broader keyword like AI, startup, cloud,
              developer, software, expo, conference, or cybersecurity.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
