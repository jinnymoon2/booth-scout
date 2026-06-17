"use client";

import { useEffect, useMemo, useState } from "react";
import { getTodayLabel, isUpcomingOrActive } from "../lib/date-utils";

type ThemeMode = "dark" | "light";
type LanguageMode = "en" | "ko";

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

const COUNTRY_OPTIONS = [
  "All countries",
  "Korea",
  "Japan",
  "United States",
];

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

const COPY = {
  en: {
    title: "Global Technology Event Scout",
    description:
      "Browse upcoming IT, startup, AI, developer, cloud, cybersecurity, hardware, robotics, and enterprise technology events. BoothScout automatically hides events that have already passed.",
    today: "Today",
    searchPlaceholder:
      "Search AI, startup, cloud, developer, Korea, Japan...",
    searchButton: "Search events",
    searching: "Searching...",
    upcomingTechEvents: "upcoming tech events",
    searchedConferences: "searched conferences",
    startupRelated: "startup-related",
    eventBadge: "Event",
    searchedBadge: "Searched conference",
    date: "Date",
    location: "Location",
    eventSource: "Event source",
    lastVerified: "Last verified",
    openEventWebsite: "Open event website →",
    noEventsTitle: "No dated upcoming tech events found.",
    noEventsDescription:
      "Try searching with a broader keyword like AI, startup, cloud, developer, software, expo, conference, or cybersecurity.",
    light: "Light",
    dark: "Dark",
    english: "EN",
    korean: "KO",
    countries: {
      "All countries": "All countries",
      Korea: "Korea",
      Japan: "Japan",
      "United States": "United States",
    },
    categories: {
      "All categories": "All categories",
      Startup: "Startup",
      AI: "AI",
      Developer: "Developer",
      Cloud: "Cloud",
      Cybersecurity: "Cybersecurity",
      Hardware: "Hardware",
      Mobility: "Mobility",
      "Smart City": "Smart City",
    },
  },
  ko: {
    title: "글로벌 기술 행사 스카우트",
    description:
      "다가오는 IT, 스타트업, AI, 개발자, 클라우드, 사이버보안, 하드웨어, 로보틱스, 엔터프라이즈 기술 행사를 찾아볼 수 있습니다. BoothScout는 이미 지난 행사를 자동으로 숨깁니다.",
    today: "오늘",
    searchPlaceholder:
      "AI, 스타트업, 클라우드, 개발자, 한국, 일본 검색...",
    searchButton: "행사 검색",
    searching: "검색 중...",
    upcomingTechEvents: "예정된 기술 행사",
    searchedConferences: "검색 기반 컨퍼런스",
    startupRelated: "스타트업 관련",
    eventBadge: "행사",
    searchedBadge: "검색 기반 컨퍼런스",
    date: "날짜",
    location: "위치",
    eventSource: "행사 출처",
    lastVerified: "최종 확인",
    openEventWebsite: "행사 웹사이트 열기 →",
    noEventsTitle: "날짜가 있는 예정 기술 행사를 찾지 못했습니다.",
    noEventsDescription:
      "AI, 스타트업, 클라우드, 개발자, 소프트웨어, 엑스포, 컨퍼런스, 사이버보안처럼 더 넓은 키워드로 검색해보세요.",
    light: "라이트",
    dark: "다크",
    english: "EN",
    korean: "KO",
    countries: {
      "All countries": "전체 국가",
      Korea: "한국",
      Japan: "일본",
      "United States": "미국",
    },
    categories: {
      "All categories": "전체 카테고리",
      Startup: "스타트업",
      AI: "AI",
      Developer: "개발자",
      Cloud: "클라우드",
      Cybersecurity: "사이버보안",
      Hardware: "하드웨어",
      Mobility: "모빌리티",
      "Smart City": "스마트시티",
    },
  },
} as const;

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
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isDark = theme === "dark";
  const isKorean = language === "ko";
  const copy = COPY[language];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("boothscout-theme");
    const savedLanguage = window.localStorage.getItem("boothscout-language");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    if (savedLanguage === "en" || savedLanguage === "ko") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("boothscout-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("boothscout-language", language);
  }, [language]);

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

  const pageClass = isDark
    ? "min-h-screen bg-slate-950 px-6 py-10 text-white"
    : "min-h-screen bg-slate-100 px-6 py-10 text-slate-950";

  const panelClass = isDark
    ? "rounded-2xl border border-slate-700 bg-slate-900/70 p-5"
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  const inputClass = isDark
    ? "rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
    : "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-cyan-500";

  const selectClass = isDark
    ? "rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-300"
    : "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-cyan-500";

  const statClass = isDark
    ? "rounded-xl border border-slate-700 px-4 py-3"
    : "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3";

  const cardClass = isDark
    ? "flex min-h-[390px] flex-col rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm"
    : "flex min-h-[390px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  const mutedTextClass = isDark ? "text-slate-400" : "text-slate-600";
  const softTextClass = isDark ? "text-slate-300" : "text-slate-700";
  const titleTextClass = isDark ? "text-white" : "text-slate-950";

  return (
    <main className={pageClass}>
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-400">
              BoothScout
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              {copy.title}
            </h1>

            <p
              className={`mt-5 max-w-3xl text-base font-medium leading-7 ${mutedTextClass}`}
            >
              {copy.description}
            </p>

            <p className={`mt-3 text-sm ${mutedTextClass}`}>
              {copy.today}:{" "}
              <span className="font-semibold text-cyan-400">
                {getTodayLabel()}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-3">
              <span
                className={
                  isDark
                    ? "text-sm font-bold text-slate-400"
                    : "text-sm font-bold text-slate-600"
                }
              >
                {copy.light}
              </span>

              <button
                type="button"
                aria-label="Toggle light and dark mode"
                aria-pressed={isDark}
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={
                  isDark
                    ? "relative h-8 w-16 rounded-full border border-cyan-400 bg-cyan-400 transition"
                    : "relative h-8 w-16 rounded-full border border-slate-300 bg-slate-300 transition"
                }
              >
                <span
                  className={
                    isDark
                      ? "absolute left-9 top-1 h-6 w-6 rounded-full bg-slate-950 transition"
                      : "absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition"
                  }
                />
              </button>

              <span
                className={
                  isDark
                    ? "text-sm font-bold text-white"
                    : "text-sm font-bold text-slate-600"
                }
              >
                {copy.dark}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={
                  isDark
                    ? "text-sm font-bold text-slate-400"
                    : "text-sm font-bold text-slate-600"
                }
              >
                {copy.english}
              </span>

              <button
                type="button"
                aria-label="Toggle English and Korean"
                aria-pressed={isKorean}
                onClick={() => setLanguage(isKorean ? "en" : "ko")}
                className={
                  isKorean
                    ? "relative h-8 w-16 rounded-full border border-cyan-400 bg-cyan-400 transition"
                    : "relative h-8 w-16 rounded-full border border-slate-300 bg-slate-300 transition"
                }
              >
                <span
                  className={
                    isKorean
                      ? "absolute left-9 top-1 h-6 w-6 rounded-full bg-slate-950 transition"
                      : "absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition"
                  }
                />
              </button>

              <span
                className={
                  isKorean
                    ? isDark
                      ? "text-sm font-bold text-white"
                      : "text-sm font-bold text-slate-950"
                    : isDark
                      ? "text-sm font-bold text-slate-400"
                      : "text-sm font-bold text-slate-600"
                }
              >
                {copy.korean}
              </span>
            </div>
          </div>
        </div>

        <div className={`mt-10 ${panelClass}`}>
          <div className="grid gap-4 md:grid-cols-[1fr_170px_180px_150px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadEvents();
                }
              }}
              placeholder={copy.searchPlaceholder}
              className={inputClass}
            />

            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className={selectClass}
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {copy.countries[option as keyof typeof copy.countries]}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={selectClass}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {copy.categories[option as keyof typeof copy.categories]}
                </option>
              ))}
            </select>

            <button
              onClick={loadEvents}
              disabled={isLoading}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? copy.searching : copy.searchButton}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className={statClass}>
              <p className="text-2xl font-black">{visibleEvents.length}</p>
              <p className={`text-sm font-semibold ${mutedTextClass}`}>
                {copy.upcomingTechEvents}
              </p>
            </div>

            <div className={statClass}>
              <p className="text-2xl font-black">
                {
                  visibleEvents.filter((event) =>
                    isSearchedConference(event)
                  ).length
                }
              </p>
              <p className={`text-sm font-semibold ${mutedTextClass}`}>
                {copy.searchedConferences}
              </p>
            </div>

            <div className={statClass}>
              <p className="text-2xl font-black">
                {
                  visibleEvents.filter((event) =>
                    matchesCategory(event, "Startup")
                  ).length
                }
              </p>
              <p className={`text-sm font-semibold ${mutedTextClass}`}>
                {copy.startupRelated}
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-500">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event, index) => (
            <article
              key={`${event.title}-${event.sourceUrl}-${event.startDate}-${index}`}
              className={cardClass}
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
                  {copy.eventBadge}
                </span>

                {isSearchedConference(event) ? (
                  <span className="rounded-full bg-purple-400 px-3 py-1 text-xs font-black text-slate-950">
                    {copy.searchedBadge}
                  </span>
                ) : null}

                {event.category ? (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                    {event.category}
                  </span>
                ) : null}

                <span
                  className={
                    isDark
                      ? "rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300"
                      : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                  }
                >
                  {event.country}
                </span>

                {event.venue ? (
                  <span
                    className={
                      isDark
                        ? "rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300"
                        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                    }
                  >
                    {event.venue}
                  </span>
                ) : null}
              </div>

              <h2 className={`mt-4 text-xl font-black leading-7 ${titleTextClass}`}>
                {event.title}
              </h2>

              <div className={`mt-5 space-y-2 text-sm ${softTextClass}`}>
                <p>
                  <span className={isDark ? "font-semibold text-slate-500" : "font-semibold text-slate-400"}>
                    {copy.date}:
                  </span>{" "}
                  {formatDateRange(event)}
                </p>

                <p>
                  <span className={isDark ? "font-semibold text-slate-500" : "font-semibold text-slate-400"}>
                    {copy.location}:
                  </span>{" "}
                  {getLocation(event)}
                </p>

                <p>
                  <span className={isDark ? "font-semibold text-slate-500" : "font-semibold text-slate-400"}>
                    {copy.eventSource}:
                  </span>{" "}
                  {event.sourceName}
                </p>

                {event.lastVerified ? (
                  <p>
                    <span className={isDark ? "font-semibold text-slate-500" : "font-semibold text-slate-400"}>
                      {copy.lastVerified}:
                    </span>{" "}
                    {event.lastVerified}
                  </p>
                ) : null}
              </div>

              {event.description ? (
                <p className={`mt-5 text-sm leading-6 ${mutedTextClass}`}>
                  {event.description}
                </p>
              ) : null}

              {event.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {Array.from(new Set(event.tags))
                    .slice(0, 6)
                    .map((tag, tagIndex) => (
                      <span
                        key={`${tag}-${tagIndex}`}
                        className={
                          isDark
                            ? "rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400"
                            : "rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500"
                        }
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
                className="mt-auto pt-6 text-sm font-bold text-cyan-400 hover:text-cyan-300"
              >
                {copy.openEventWebsite}
              </a>
            </article>
          ))}
        </div>

        {!isLoading && visibleEvents.length === 0 ? (
          <div
            className={
              isDark
                ? "mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center"
                : "mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
            }
          >
            <h2 className="text-xl font-black">{copy.noEventsTitle}</h2>
            <p className={`mt-3 text-sm ${mutedTextClass}`}>
              {copy.noEventsDescription}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
