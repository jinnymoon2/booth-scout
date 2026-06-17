import { supabaseAdmin } from "./supabase-admin";

type DiscoveryInput = {
  q?: string;
  country?: string;
};

type Source = {
  name: string;
  url: string;
  country: string;
};

type ExtractedEvent = {
  name?: string;
  description?: string;
  website_url?: string;
  sponsor_url?: string;
  country?: string;
  city?: string;
  region?: string;
  venue?: string;
  start_date?: string;
  end_date?: string;
  application_deadline?: string | null;
  booth_status?: string;
  booth_price_min?: number | null;
  booth_price_max?: number | null;
  booth_price_currency?: string;
  price_visibility?: string;
  event_format?: string;
  event_category?: string;
  audience_type?: string;
  estimated_attendees?: number | null;
};

const DISCOVERY_MAX_PAGES = Number(process.env.DISCOVERY_MAX_PAGES || 30);

const EVENT_SOURCES: Source[] = [
  {
    name: "COEX Exhibitions",
    url: "https://www.coexcenter.com/event-type/exhibitions/",
    country: "Korea",
  },
  {
    name: "COEX Event Calendar",
    url: "https://www.coexcenter.com/event-calendar/",
    country: "Korea",
  },
  {
    name: "COEX Events This Month",
    url: "https://www.coexcenter.com/events-this-month/",
    country: "Korea",
  },
  {
    name: "COEX Events Next Month",
    url: "https://www.coexcenter.com/events-next-month/",
    country: "Korea",
  },
  {
    name: "COEX Korean Full Schedule",
    url: "https://www.coex.co.kr/event/full-schedules/",
    country: "Korea",
  },
  {
    name: "KINTEX Event List",
    url: "https://www.kintex.com/web/en/event/list.do",
    country: "Korea",
  },
  {
    name: "KINTEX Event Calendar",
    url: "https://www.kintex.com/web/en/event/clist.do",
    country: "Korea",
  },
  {
    name: "SETEC Exhibition Schedule",
    url: "https://www.setec.or.kr/front/schedule/list.do",
    country: "Korea",
  },
  {
    name: "SETEC Monthly Calendar",
    url: "https://www.setec.or.kr/front/schedule/calendar.do",
    country: "Korea",
  },
  {
    name: "Visit Seoul Exhibitions and Events",
    url: "https://english.visitseoul.net/exhibition-events",
    country: "Korea",
  },
  {
    name: "TradeIndia Seoul Trade Shows",
    url: "https://www.tradeindia.com/tradeshows/city/seoul/218455/year-2026/june/",
    country: "Korea",
  },
  {
    name: "Eventseye COEX Trade Shows",
    url: "https://www.eventseye.com/fairs/pl1_trade-shows_seoul_326.html",
    country: "Korea",
  },
  {
    name: "Eventseye KINTEX Trade Shows",
    url: "https://www.eventseye.com/fairs/pl1_trade-shows_seoul_1555.html",
    country: "Korea",
  },
  {
    name: "MVEX Official",
    url: "https://metavexpo.com/eng/",
    country: "Korea",
  },
  {
    name: "NextRise Official",
    url: "https://www.nextrise.co.kr/en/about",
    country: "Korea",
  },
];

const VALID_EVENT_CATEGORIES = new Set([
  "general_it",
  "developer_tools",
  "cloud_infrastructure",
  "cybersecurity",
  "ai_data",
  "devops_sre",
  "networking_infrastructure",
  "enterprise_software",
  "saas",
  "startup_tech",
  "hardware_iot",
  "fintech_it",
  "healthtech_it",
  "education_tech",
  "mixed",
  "unknown",
]);

const VALID_AUDIENCE_TYPES = new Set([
  "developers",
  "it_decision_makers",
  "security_professionals",
  "cloud_infra_engineers",
  "data_ai_teams",
  "network_engineers",
  "enterprise_tech_buyers",
  "startup_founders",
  "marketers",
  "mixed",
  "unknown",
]);

const VALID_EVENT_FORMATS = new Set([
  "expo_networking",
  "conference_sessions",
  "mixed",
  "unknown",
]);

const VALID_BOOTH_STATUSES = new Set([
  "open",
  "waitlist",
  "sold_out",
  "unknown",
]);

const VALID_PRICE_VISIBILITY = new Set([
  "public",
  "estimated",
  "contact_for_pricing",
  "unknown",
]);

export async function discoverAndStoreEvents(input: DiscoveryInput) {
  const q = (input.q || "").toLowerCase();
  const country = (input.country || "").toLowerCase();

  const shouldRunKoreaSources =
    !q ||
    q.includes("korea") ||
    q.includes("korea") ||
    q.includes("seoul") ||
    q.includes("coex") ||
    q.includes("kintex") ||
    q.includes("setec") ||
    country.includes("korea");

  if (!shouldRunKoreaSources) {
    return {
      ok: true,
      discovered: 0,
      scanned: 0,
      message: "No matching discovery source for this query yet.",
    };
  }

  const pages = await buildCrawlQueue(EVENT_SOURCES, DISCOVERY_MAX_PAGES);

  let totalSaved = 0;
  let totalScanned = 0;

  for (const page of pages) {
    try {
      totalScanned += 1;

      const html = await fetchWithTimeout(page.url, 12000);
      const text = htmlToText(html).slice(0, 22000);

      const events = await extractEventsWithOllama({
        sourceName: page.name,
        sourceUrl: page.url,
        country: page.country,
        text,
      });

      const relevantEvents = events.filter((event) => isRelevantItOrTechEvent(event));

      for (const event of relevantEvents) {
        const saved = await upsertEvent(event, page.url);
        if (saved) totalSaved += 1;
      }
    } catch (error) {
      console.error("[event-discovery:error]", page.url, error);
    }
  }

  return {
    ok: true,
    discovered: totalSaved,
    scanned: totalScanned,
  };
}

async function buildCrawlQueue(seedSources: Source[], maxPages: number): Promise<Source[]> {
  const queue: Source[] = [];
  const seen = new Set<string>();

  for (const source of seedSources) {
    addToQueue(queue, seen, source, maxPages);
  }

  const seedSnapshot = [...queue];

  for (const source of seedSnapshot) {
    if (queue.length >= maxPages) break;

    try {
      const html = await fetchWithTimeout(source.url, 8000);
      const links = extractCandidateLinks(html, source.url);

      for (const link of links) {
        if (queue.length >= maxPages) break;

        addToQueue(
          queue,
          seen,
          {
            name: `${source.name} linked page`,
            url: link,
            country: source.country,
          },
          maxPages
        );
      }
    } catch (error) {
      console.error("[event-discovery:crawl-link-error]", source.url, error);
    }
  }

  return queue.slice(0, maxPages);
}

function addToQueue(
  queue: Source[],
  seen: Set<string>,
  source: Source,
  maxPages: number
) {
  if (queue.length >= maxPages) return;
  if (seen.has(source.url)) return;

  seen.add(source.url);
  queue.push(source);
}

function extractCandidateLinks(html: string, baseUrl: string) {
  const links = new Set<string>();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = hrefRegex.exec(html))) {
    const href = match[1];

    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }

    let absoluteUrl: string;

    try {
      absoluteUrl = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    const lower = absoluteUrl.toLowerCase();

    const looksLikeEventPage =
      lower.includes("event") ||
      lower.includes("exhibition") ||
      lower.includes("schedule") ||
      lower.includes("fair") ||
      lower.includes("expo") ||
      lower.includes("show") ||
      lower.includes("trade") ||
      lower.includes("view") ||
      lower.includes("list") ||
      lower.includes("coex") ||
      lower.includes("kintex") ||
      lower.includes("setec");

    const shouldSkip =
      lower.includes("facebook.com") ||
      lower.includes("instagram.com") ||
      lower.includes("youtube.com") ||
      lower.includes("linkedin.com") ||
      lower.includes(".pdf") ||
      lower.includes(".jpg") ||
      lower.includes(".png") ||
      lower.includes(".zip");

    if (looksLikeEventPage && !shouldSkip) {
      links.add(absoluteUrl);
    }
  }

  return Array.from(links).slice(0, 20);
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 BoothScoutBot/0.2 event discovery for exhibitor directory",
      },
      next: {
        revalidate: 60 * 60 * 6,
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function extractEventsWithOllama({
  sourceName,
  sourceUrl,
  country,
  text,
}: {
  sourceName: string;
  sourceUrl: string;
  country: string;
  text: string;
}): Promise<ExtractedEvent[]> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  const prompt = `
You are extracting event records for BoothScout, an exhibitor-first event directory.

Source name: ${sourceName}
Source URL: ${sourceUrl}
Default country: ${country}

Extract MANY relevant events, not just one.

Include IT, technology, startup, business technology, software, AI, cloud, cybersecurity, infrastructure, networking, SaaS, hardware, IoT, robotics, automation, digital transformation, electronics, semiconductor, mobility, smart factory, display, e-commerce, fintech, enterprise technology, developer, data, metaverse, XR, VR, AR, and business expo events.

Exclude events that are clearly unrelated to booths/exhibitions, such as concerts, pure art shows, sports matches, drinking-only events, and beauty-only consumer fairs.

If booth information is not visible, keep booth_status as "unknown" and price_visibility as "contact_for_pricing".

Return JSON only with this exact shape:
{
  "events": [
    {
      "name": "string",
      "description": "string",
      "website_url": "string or null",
      "sponsor_url": "string or null",
      "country": "${country}",
      "city": "string or null",
      "region": "string or null",
      "venue": "string or null",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null",
      "application_deadline": null,
      "booth_status": "open | waitlist | sold_out | unknown",
      "booth_price_min": null,
      "booth_price_max": null,
      "booth_price_currency": "KRW",
      "price_visibility": "public | estimated | contact_for_pricing | unknown",
      "event_format": "expo_networking | conference_sessions | mixed | unknown",
      "event_category": "general_it | developer_tools | cloud_infrastructure | cybersecurity | ai_data | devops_sre | networking_infrastructure | enterprise_software | saas | startup_tech | hardware_iot | fintech_it | healthtech_it | education_tech | mixed | unknown",
      "audience_type": "developers | it_decision_makers | security_professionals | cloud_infra_engineers | data_ai_teams | network_engineers | enterprise_tech_buyers | startup_founders | marketers | mixed | unknown",
      "estimated_attendees": null
    }
  ]
}

Rules:
- Convert dates to YYYY-MM-DD.
- If the page lists multiple events, extract multiple events.
- If the venue is COEX, KINTEX, SETEC, aT Center, or another venue, include it.
- Do not invent exact booth prices.
- Prefer "unknown" over making up missing facts.
- Output valid JSON only.

Page text:
${text}
`;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama failed: ${response.status}`);
  }

  const result = await response.json();
  const raw = result.response || "{}";

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    console.error("[event-discovery:bad-json]", raw);
    return [];
  }
}

function isRelevantItOrTechEvent(event: ExtractedEvent) {
  const haystack = [
    event.name,
    event.description,
    event.event_category,
    event.audience_type,
    event.venue,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const positiveTerms = [
    "it",
    "tech",
    "technology",
    "software",
    "cloud",
    "ai",
    "artificial intelligence",
    "data",
    "big data",
    "cyber",
    "security",
    "developer",
    "startup",
    "metaverse",
    "xr",
    "vr",
    "ar",
    "digital",
    "network",
    "infrastructure",
    "robot",
    "automation",
    "smart factory",
    "saas",
    "iot",
    "enterprise",
    "electronics",
    "semiconductor",
    "display",
    "mobility",
    "e-commerce",
    "commerce",
    "fintech",
    "business",
    "expo",
    "exhibition",
    "conference",
    "trade",
    "show",
    "fair",
    "산업",
    "기술",
    "박람회",
    "전시",
    "스타트업",
    "인공지능",
    "데이터",
    "보안",
    "자동화",
    "로봇",
    "소프트웨어",
    "클라우드",
  ];

  const negativeTerms = [
    "concert",
    "sports match",
    "wine tasting only",
    "beauty only",
  ];

  if (negativeTerms.some((term) => haystack.includes(term))) {
    return false;
  }

  return positiveTerms.some((term) => haystack.includes(term));
}

async function upsertEvent(event: ExtractedEvent, sourceUrl: string) {
  if (!event.name || !event.start_date) {
    return false;
  }

  const slug = slugify(`${event.name}-${event.start_date}`);

  const record = {
    name: event.name,
    slug,
    description: event.description || null,
    website_url: event.website_url || sourceUrl,
    sponsor_url: event.sponsor_url || event.website_url || sourceUrl,
    country: event.country || "Korea",
    city: event.city || inferCity(event.venue) || "Seoul",
    region: event.region || null,
    venue: event.venue || null,
    start_date: event.start_date,
    end_date: event.end_date || null,
    application_deadline: event.application_deadline || null,
    booth_status: safeValue(event.booth_status, VALID_BOOTH_STATUSES, "unknown"),
    booth_price_min: event.booth_price_min || null,
    booth_price_max: event.booth_price_max || null,
    booth_price_currency: event.booth_price_currency || "KRW",
    price_visibility: safeValue(
      event.price_visibility,
      VALID_PRICE_VISIBILITY,
      "contact_for_pricing"
    ),
    event_format: safeValue(event.event_format, VALID_EVENT_FORMATS, "expo_networking"),
    event_category: safeValue(event.event_category, VALID_EVENT_CATEGORIES, "general_it"),
    audience_type: safeValue(event.audience_type, VALID_AUDIENCE_TYPES, "mixed"),
    estimated_attendees: event.estimated_attendees || null,
    source_url: sourceUrl,
    verified_status: "scraped",
    last_verified_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("events").upsert(record, {
    onConflict: "slug",
  });

  if (error) {
    console.error("[event-discovery:upsert-error]", error.message);
    return false;
  }

  return true;
}

function inferCity(venue?: string | null) {
  if (!venue) return null;

  const lower = venue.toLowerCase();

  if (
    lower.includes("coex") ||
    lower.includes("setec") ||
    lower.includes("aT center".toLowerCase())
  ) {
    return "Seoul";
  }

  if (lower.includes("kintex")) {
    return "Goyang";
  }

  return null;
}

function safeValue(
  value: string | null | undefined,
  validValues: Set<string>,
  fallback: string
) {
  if (!value) return fallback;
  return validValues.has(value) ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 100);
}
