import {
  EVENT_SOURCES,
  IT_EVENT_KEYWORDS,
  getSourcesForCountry,
  normalizeCountry,
} from "./event-sources";
import { isUpcomingOrActive } from "./date-utils";
import { CURATED_TECH_EVENTS } from "./curated-events";
import { loadManualEvents } from "./manual-events";
import { isTechnologyRelatedEvent, isTechnologyRelatedText } from "./event-filter";
import { resolveEventWebsiteForCandidate } from "./event-links";

export type DiscoveredEvent = {
  title: string;
  country: string;
  city?: string;
  venue?: string;
  sourceName: string;
  sourceUrl: string;
  url: string;
  description?: string;
  tags: string[];
  startDate?: string;
  endDate?: string;
};

const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#\d+;/g, " ");
}

function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function unique<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item).toLowerCase().trim();

    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 BoothScout/1.0 event discovery bot; local development",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
      },
    });

    if (!response.ok) return "";

    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeYear(rawYear: string) {
  if (rawYear.length === 2) {
    return `20${rawYear}`;
  }

  return rawYear;
}

function isoDate(year: string, month: string, day: string) {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function extractDateRange(text: string): {
  startDate?: string;
  endDate?: string;
} {
  const ymdRange = text.match(
    /\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\s*(?:~|-|–|—|to|～)\s*(?:(20\d{2})[./-])?(\d{1,2})[./-](\d{1,2})\b/
  );

  if (ymdRange) {
    const startYear = ymdRange[1];
    const endYear = ymdRange[4] || startYear;

    return {
      startDate: isoDate(startYear, ymdRange[2], ymdRange[3]),
      endDate: isoDate(endYear, ymdRange[5], ymdRange[6]),
    };
  }

  const singleYmd = text.match(/\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/);

  if (singleYmd) {
    const date = isoDate(singleYmd[1], singleYmd[2], singleYmd[3]);

    return {
      startDate: date,
      endDate: date,
    };
  }

  const monthDayRange = text.match(
    /\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:~|-|–|—|to)\s*(?:(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+)?(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(\d{2,4})\b/i
  );

  if (monthDayRange) {
    const startMonth = MONTHS[monthDayRange[1].toLowerCase()];
    const endMonth = MONTHS[(monthDayRange[3] || monthDayRange[1]).toLowerCase()];
    const year = normalizeYear(monthDayRange[5]);

    return {
      startDate: isoDate(year, startMonth, monthDayRange[2]),
      endDate: isoDate(year, endMonth, monthDayRange[4]),
    };
  }

  const dayMonthRange = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:~|-|–|—|to)\s*(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*[,]?\s+(\d{2,4})\b/i
  );

  if (dayMonthRange) {
    const month = MONTHS[dayMonthRange[3].toLowerCase()];
    const year = normalizeYear(dayMonthRange[4]);

    return {
      startDate: isoDate(year, month, dayMonthRange[1]),
      endDate: isoDate(year, month, dayMonthRange[2]),
    };
  }

  const monthSingle = text.match(
    /\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(\d{2,4})\b/i
  );

  if (monthSingle) {
    const month = MONTHS[monthSingle[1].toLowerCase()];
    const year = normalizeYear(monthSingle[3]);
    const date = isoDate(year, month, monthSingle[2]);

    return {
      startDate: date,
      endDate: date,
    };
  }

  return {};
}

function normalizeSchemaDate(value: unknown) {
  if (!value || typeof value !== "string") return undefined;

  const match = value.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const fallback = extractDateRange(value);

  return fallback.startDate || fallback.endDate;
}

function toText(value: unknown) {
  if (typeof value === "string") return decodeEntities(value).trim();

  return "";
}

function isBoilerplateText(text: string) {
  const lower = text.toLowerCase();

  const boilerplatePatterns = [
    "get in touch",
    "open in google maps",
    "open in naver maps",
    "quick links",
    "event calendar",
    "coex visitors",
    "planners attendees",
    "about contact us",
    "who we are",
    "fields of business",
    "partnerships",
    "corporate identity",
    "performance location",
    "category convention",
    "conference 401",
    "conference 402",
    "exhibition 320",
    "b1 hall",
    "visitor guide",
    "privacy policy",
    "terms of use",
    "newsletter",
    "site map",
    "login",
    "sign up",
    "copyright",
    "all rights reserved",
    "limited packages",
    "become a sponsor",
    "sponsor today",
    "learn more play",
    "learn more",
    "play video",
    "watch now",
    "register now",
    "register today",
    "buy tickets",
    "early bird",
    "save your spot",
    "view agenda",
    "view full schedule",
    "download brochure",
    "문의",
    "오시는 길",
    "공지사항",
    "고객 문의",
    "개인정보",
    "이용약관",
    "알림 받기",
    "알림 취소하기",
    "입력해주세요",
  ];

  return boilerplatePatterns.some((pattern) => lower.includes(pattern));
}

function cleanEventTitle(rawTitle: string, sourceName: string) {
  let title = decodeEntities(rawTitle)
    .replace(/\s+/g, " ")
    .replace(/[#]+/g, " ")
    .trim();

  if (!title || isBoilerplateText(title)) return "";

  title = title
    .replace(new RegExp(sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ")
    .replace(/\bEvent Calendar\b/gi, " ")
    .replace(/\bEvents?\s*[-–—]\s*/gi, " ")
    .replace(/\bCoex Visitors\b/gi, " ")
    .replace(/\bCOEX Korean Full Schedule\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const firstDateIndex = title.search(
    /\b(20\d{2})[./-]\d{1,2}[./-]\d{1,2}\b|\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+\d{1,2}/i
  );

  if (firstDateIndex > 5) {
    title = title.slice(0, firstDateIndex).trim();
  }

  title = title
    .split(/\bDate\s*:/i)[0]
    .split(/\bLocation\s*:/i)[0]
    .split(/\bVenue\s*:/i)[0]
    .split(/\bSource\s*:/i)[0]
    .split(/\bStatus\s*:/i)[0]
    .split(/\bHall\s+[A-Z0-9]/i)[0]
    .split(/\bConference Room/i)[0]
    .replace(/\s*[-–—|]\s*$/, "")
    .replace(/^[,;:\-\s]+/, "")
    .replace(/[,;:\-\s]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (isBoilerplateText(title)) return "";

  const words = title.split(/\s+/);

  if (words.length > 16) return "";
  if (title.length < 3 || title.length > 100) return "";

  return title;
}

function scoreLine(line: string) {
  const lower = line.toLowerCase();
  let score = 0;

  for (const keyword of IT_EVENT_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  if (/\b20\d{2}\b|\b\d{1,2}\s*(?:~|-|–|—|to)\s*\d{1,2}\b/i.test(line)) {
    score += 2;
  }

  if (
    /\bconference|expo|summit|week|forum|fair|show|festival|meetup|demo day|exhibition|전시|박람회|컨퍼런스|포럼|세미나|행사\b/i.test(
      line
    )
  ) {
    score += 2;
  }

  if (line.length >= 12 && line.length <= 220) score += 1;
  if (line.length > 300) score -= 5;
  if (isBoilerplateText(line)) score -= 10;

  return score;
}

function extractCandidateLines(text: string) {
  const chunks = text
    .split(/(?<=[.!?])\s+|\s{2,}|\n|•|·|\|/g)
    .map((line) => line.trim())
    .filter(Boolean);

  return chunks
    .map((line) => ({
      line,
      score: scoreLine(line),
    }))
    .filter((item) => item.score >= 3 && isTechnologyRelatedText(item.line))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100)
    .map((item) => item.line);
}

function tagsFromText(text: string) {
  const lower = text.toLowerCase();

  return IT_EVENT_KEYWORDS.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  ).slice(0, 8);
}

function matchesQuery(text: string, query?: string) {
  if (!query || !query.trim()) return true;

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedText.includes(normalizedQuery)) return true;

  const queryWords = normalizedQuery
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);

  return queryWords.some((word) => normalizedText.includes(word));
}

function normalizeEventType(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function findJsonLdEvents(value: unknown): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  function walk(node: unknown) {
    if (!node) return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    if (typeof node !== "object") return;

    const object = node as Record<string, unknown>;
    const types = normalizeEventType(object["@type"]).map((type) =>
      type.toLowerCase()
    );

    if (types.includes("event")) {
      results.push(object);
    }

    for (const value of Object.values(object)) {
      walk(value);
    }
  }

  walk(value);

  return results;
}

function extractJsonLdObjects(html: string): unknown[] {
  const scripts = [...html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )];

  const parsed: unknown[] = [];

  for (const script of scripts) {
    const raw = decodeEntities(script[1]).trim();

    if (!raw) continue;

    try {
      parsed.push(JSON.parse(raw));
    } catch {
      const cleaned = raw
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

      try {
        parsed.push(JSON.parse(cleaned));
      } catch {
        continue;
      }
    }
  }

  return parsed;
}

function locationFromJsonLd(value: unknown) {
  if (!value || typeof value !== "object") return {};

  const location = value as Record<string, unknown>;
  const name = toText(location.name);
  const address = location.address;

  let city = "";

  if (address && typeof address === "object") {
    const addressObject = address as Record<string, unknown>;
    city =
      toText(addressObject.addressLocality) ||
      toText(addressObject.addressRegion) ||
      "";
  }

  return {
    venue: name || undefined,
    city: city || undefined,
  };
}

function eventFromJsonLd(
  jsonEvent: Record<string, unknown>,
  source: (typeof EVENT_SOURCES)[number]
): DiscoveredEvent | null {
  const name = cleanEventTitle(toText(jsonEvent.name), source.name);

  if (!name) return null;

  const startDate = normalizeSchemaDate(jsonEvent.startDate);
  const endDate =
    normalizeSchemaDate(jsonEvent.endDate) ||
    normalizeSchemaDate(jsonEvent.startDate);

  if (!startDate && !endDate) return null;

  const location = locationFromJsonLd(jsonEvent.location);
  const description = toText(jsonEvent.description);
  const eventUrl = toText(jsonEvent.url) || source.url;

  const combined = `${name} ${description} ${source.name}`;

  if (!isTechnologyRelatedText(combined)) return null;

  const event: DiscoveredEvent = {
    title: name,
    country: source.country,
    city: location.city || source.city,
    venue: location.venue || source.venue,
    sourceName: source.name,
    sourceUrl: source.url,
    url: eventUrl,
    description:
      description ||
      `Discovered from structured event metadata on ${source.name}.`,
    tags: tagsFromText(combined),
    startDate,
    endDate,
  };

  if (!isUpcomingOrActive(event)) return null;

  return event;
}

export async function discoverITEvents(options?: {
  country?: string;
  query?: string;
  limit?: number;
}) {
  const country = normalizeCountry(options?.country);
  const query = options?.query?.trim() ?? "";
  const limit = options?.limit ?? 250;

  const sources = getSourcesForCountry(country);
  const discovered: DiscoveredEvent[] = [];

  await Promise.allSettled(
    sources.map(async (source) => {
      const html = await fetchText(source.url);

      if (!html) return;

      const jsonLdObjects = extractJsonLdObjects(html);

      for (const object of jsonLdObjects) {
        const jsonEvents = findJsonLdEvents(object);

        for (const jsonEvent of jsonEvents) {
          const event = eventFromJsonLd(jsonEvent, source);

          if (event) {
            discovered.push(event);
          }
        }
      }

      const text = stripHtml(html);
      const candidates = extractCandidateLines(text);

      for (const candidate of candidates) {
        const dates = extractDateRange(candidate);

        if (!dates.startDate && !dates.endDate) {
          continue;
        }

        const cleanTitle = cleanEventTitle(candidate, source.name);

        if (!cleanTitle) continue;

        const combined = `${cleanTitle} ${candidate} ${source.name} ${
          source.venue ?? ""
        } ${source.city ?? ""} ${source.country}`;

        if (!isTechnologyRelatedText(combined)) continue;

        const event: DiscoveredEvent = {
          title: cleanTitle,
          country: source.country,
          city: source.city,
          venue: source.venue,
          sourceName: source.name,
          sourceUrl: source.url,
          url: await resolveEventWebsiteForCandidate({
            html,
            sourceUrl: source.url,
            title: cleanTitle,
            candidate,
          }),
          description: `Discovered from ${source.name}. Please verify the final schedule on the official event page.`,
          tags: tagsFromText(combined),
          startDate: dates.startDate,
          endDate: dates.endDate,
        };

        if (isUpcomingOrActive(event)) {
          discovered.push(event);
        }
      }
    })
  );

  const manualEvents = loadManualEvents();

  const curatedAndManualCandidates = [...CURATED_TECH_EVENTS, ...manualEvents].filter(
    (event): event is DiscoveredEvent => Boolean(event)
  );

  const curatedAndManualMatches = curatedAndManualCandidates.filter((event) => {
    const combined = [
      event.title,
      event.country,
      event.city,
      event.venue,
      event.sourceName,
      event.description,
      ...(event.tags || []),
    ]
      .filter(Boolean)
      .join(" ");

    const countryMatches = country === "Global" || event.country === country;

    return (
      countryMatches &&
      matchesQuery(combined, query) &&
      Boolean(event.startDate || event.endDate) &&
      isTechnologyRelatedEvent(event) &&
      isUpcomingOrActive(event)
    );
  });

  return unique(
    [...curatedAndManualMatches, ...discovered].filter(
      (event): event is DiscoveredEvent => Boolean(event)
    ),
    (event) => {
      return `${event.title}-${event.country}-${event.venue ?? ""}-${
        event.startDate ?? ""
      }-${event.endDate ?? ""}`;
    }
  )
    .filter((event) => Boolean(event.startDate || event.endDate))
    .filter((event) => {
      const combined = [
        event.title,
        event.country,
        event.city,
        event.venue,
        event.sourceName,
        event.description,
        ...(event.tags || []),
      ]
        .filter(Boolean)
        .join(" ");

      return matchesQuery(combined, query);
    })
    .filter(isTechnologyRelatedEvent)
    .filter(isUpcomingOrActive)
    .sort((a, b) => {
      const aTime = new Date(a.startDate || a.endDate || "9999-12-31").getTime();
      const bTime = new Date(b.startDate || b.endDate || "9999-12-31").getTime();

      return aTime - bTime;
    })
    .slice(0, limit);
}
