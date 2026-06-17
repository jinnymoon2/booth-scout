import {
  EVENT_SOURCES,
  IT_EVENT_KEYWORDS,
  getSourcesForCountry,
  looksLikeITEvent,
  normalizeCountry,
} from "./event-sources";
import { isUpcomingOrActive } from "./date-utils";

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

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
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
  const timeout = setTimeout(() => controller.abort(), 10000);

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

function extractDateRange(text: string): {
  startDate?: string;
  endDate?: string;
} {
  const ymdRange = text.match(
    /\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\s*(?:~|-|–|—|to)\s*(?:(20\d{2})[./-])?(\d{1,2})[./-](\d{1,2})\b/
  );

  if (ymdRange) {
    const startYear = ymdRange[1];
    const startMonth = ymdRange[2].padStart(2, "0");
    const startDay = ymdRange[3].padStart(2, "0");
    const endYear = ymdRange[4] || startYear;
    const endMonth = ymdRange[5].padStart(2, "0");
    const endDay = ymdRange[6].padStart(2, "0");

    return {
      startDate: `${startYear}-${startMonth}-${startDay}`,
      endDate: `${endYear}-${endMonth}-${endDay}`,
    };
  }

  const singleYmd = text.match(/\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/);

  if (singleYmd) {
    const year = singleYmd[1];
    const month = singleYmd[2].padStart(2, "0");
    const day = singleYmd[3].padStart(2, "0");

    return {
      startDate: `${year}-${month}-${day}`,
      endDate: `${year}-${month}-${day}`,
    };
  }

  const monthRange = text.match(
    /\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:~|-|–|—|to)\s*(?:(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+)?(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(20\d{2})\b/i
  );

  if (monthRange) {
    const startMonth = monthRange[1];
    const startDay = monthRange[2];
    const endMonth = monthRange[3] || startMonth;
    const endDay = monthRange[4];
    const year = monthRange[5];

    return {
      startDate: `${startMonth} ${startDay}, ${year}`,
      endDate: `${endMonth} ${endDay}, ${year}`,
    };
  }

  const monthSingle = text.match(
    /\b(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(20\d{2})\b/i
  );

  if (monthSingle) {
    return {
      startDate: `${monthSingle[1]} ${monthSingle[2]}, ${monthSingle[3]}`,
      endDate: `${monthSingle[1]} ${monthSingle[2]}, ${monthSingle[3]}`,
    };
  }

  return {};
}

function scoreLine(line: string) {
  const lower = line.toLowerCase();
  let score = 0;

  for (const keyword of IT_EVENT_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  if (/\b20\d{2}\b/.test(line)) score += 1;

  if (
    /\bconference|expo|summit|week|forum|fair|show|festival|meetup|demo day|exhibition|전시|박람회|컨퍼런스|포럼|세미나|행사\b/i.test(
      line
    )
  ) {
    score += 2;
  }

  if (line.length >= 12 && line.length <= 180) score += 1;
  if (line.length > 240) score -= 2;

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
    .filter((item) => item.score >= 3 && looksLikeITEvent(item.line))
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
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

      const text = stripHtml(html);
      const candidates = extractCandidateLines(text);

      for (const candidate of candidates) {
        const combined = `${candidate} ${source.name} ${source.venue ?? ""} ${
          source.city ?? ""
        } ${source.country}`;

        if (!matchesQuery(combined, query)) continue;

        const dates = extractDateRange(candidate);

        const event: DiscoveredEvent = {
          title: candidate.slice(0, 140),
          country: source.country,
          city: source.city,
          venue: source.venue,
          sourceName: source.name,
          sourceUrl: source.url,
          url: source.url,
          description: `Discovered from ${source.name}. Please verify the final schedule on the official source page.`,
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

  const fallbackSources: DiscoveredEvent[] = EVENT_SOURCES.filter((source) => {
    const combined = `${source.name} ${source.venue ?? ""} ${source.country}`;

    if (!matchesQuery(combined, query)) return false;

    return looksLikeITEvent(combined) || source.sourceType !== "venue-calendar";
  }).map((source) => ({
    title: source.name,
    country: source.country,
    city: source.city,
    venue: source.venue,
    sourceName: source.name,
    sourceUrl: source.url,
    url: source.url,
    description:
      "Continuously updated source for finding IT, AI, startup, developer, and technology-related events.",
    tags: tagsFromText(source.name),
  }));

  return unique([...discovered, ...fallbackSources], (event) => {
    return `${event.title}-${event.country}-${event.venue ?? ""}`;
  })
    .filter(isUpcomingOrActive)
    .slice(0, limit);
}
