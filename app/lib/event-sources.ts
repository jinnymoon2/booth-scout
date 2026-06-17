export type EventSource = {
  name: string;
  country: "Korea" | "Japan" | "United States" | "Global";
  city?: string;
  venue?: string;
  url: string;
  sourceType:
    | "venue-calendar"
    | "official-event"
    | "conference-directory"
    | "startup-directory";
};

export const COUNTRY_ALIASES: Record<
  string,
  "Korea" | "Japan" | "United States" | "Global"
> = {
  korea: "Korea",
  "south korea": "Korea",
  republicofkorea: "Korea",
  "republic of korea": "Korea",
  한국: "Korea",
  대한민국: "Korea",

  japan: "Japan",
  일본: "Japan",
  日本: "Japan",

  usa: "United States",
  us: "United States",
  america: "United States",
  "united states": "United States",
  미국: "United States",

  global: "Global",
  worldwide: "Global",
};

export function normalizeCountry(input?: string | null) {
  if (!input) return "Global";

  const key = input.toLowerCase().replace(/\s+/g, " ").trim();

  return COUNTRY_ALIASES[key] ?? input;
}

export const IT_EVENT_KEYWORDS = [
  "AI",
  "artificial intelligence",
  "machine learning",
  "LLM",
  "generative AI",
  "agent",
  "MCP",
  "data",
  "big data",
  "cloud",
  "SaaS",
  "software",
  "developer",
  "devrel",
  "open source",
  "programming",
  "engineering",
  "API",
  "platform",
  "startup",
  "venture",
  "accelerator",
  "demo day",
  "innovation",
  "digital transformation",
  "DX",
  "enterprise",
  "B2B",
  "fintech",
  "edtech",
  "healthtech",
  "cybersecurity",
  "security",
  "zero trust",
  "network",
  "infrastructure",
  "database",
  "DevOps",
  "Kubernetes",
  "cloud native",
  "serverless",
  "semiconductor",
  "robotics",
  "smart factory",
  "automation",
  "IoT",
  "mobility",
  "display",
  "electronics",
  "manufacturing tech",
  "XR",
  "AR",
  "VR",
  "blockchain",
  "web3",

  "인공지능",
  "생성형 AI",
  "개발자",
  "소프트웨어",
  "스타트업",
  "벤처",
  "클라우드",
  "보안",
  "사이버보안",
  "데이터",
  "빅데이터",
  "디지털전환",
  "반도체",
  "로봇",
  "스마트팩토리",
  "자동화",
  "모빌리티",
  "블록체인",

  "人工知能",
  "生成AI",
  "開発者",
  "ソフトウェア",
  "スタートアップ",
  "クラウド",
  "セキュリティ",
  "データ",
  "半導体",
  "ロボット",
];

export const EVENT_SOURCES: EventSource[] = [
  {
    name: "COEX Event Calendar",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.coexcenter.com/event-calendar/",
    sourceType: "venue-calendar",
  },
  {
    name: "COEX Korean Full Schedule",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.coex.co.kr/event/full-schedules/",
    sourceType: "venue-calendar",
  },
  {
    name: "KINTEX Event Calendar",
    country: "Korea",
    city: "Goyang",
    venue: "KINTEX",
    url: "https://www.kintex.com/web/en/event/list.do",
    sourceType: "venue-calendar",
  },
  {
    name: "SETEC Event Calendar",
    country: "Korea",
    city: "Seoul",
    venue: "SETEC",
    url: "https://www.setec.or.kr",
    sourceType: "venue-calendar",
  },
  {
    name: "BEXCO Event Calendar",
    country: "Korea",
    city: "Busan",
    venue: "BEXCO",
    url: "https://www.bexco.co.kr",
    sourceType: "venue-calendar",
  },
  {
    name: "EXCO Event Calendar",
    country: "Korea",
    city: "Daegu",
    venue: "EXCO",
    url: "https://www.exco.co.kr",
    sourceType: "venue-calendar",
  },

  {
    name: "AI EXPO KOREA",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.aiexpo.co.kr",
    sourceType: "official-event",
  },
  {
    name: "Smart Tech Korea",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.smarttechkorea.com",
    sourceType: "official-event",
  },
  {
    name: "World IT Show",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.worlditshow.co.kr",
    sourceType: "official-event",
  },
  {
    name: "NextRise",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.nextrise.co.kr",
    sourceType: "startup-directory",
  },
  {
    name: "Try Everything",
    country: "Korea",
    city: "Seoul",
    url: "https://www.tryeverything.or.kr",
    sourceType: "startup-directory",
  },
  {
    name: "K-Display",
    country: "Korea",
    city: "Seoul",
    venue: "COEX",
    url: "https://www.k-display.org",
    sourceType: "official-event",
  },

  {
    name: "Tokyo Big Sight Event Calendar",
    country: "Japan",
    city: "Tokyo",
    venue: "Tokyo Big Sight",
    url: "https://www.bigsight.jp/english/visitor/event/",
    sourceType: "venue-calendar",
  },
  {
    name: "Makuhari Messe Event Calendar",
    country: "Japan",
    city: "Chiba",
    venue: "Makuhari Messe",
    url: "https://www.m-messe.co.jp/en/event/",
    sourceType: "venue-calendar",
  },
  {
    name: "SusHi Tech Tokyo",
    country: "Japan",
    city: "Tokyo",
    url: "https://sushitech-startup.metro.tokyo.lg.jp",
    sourceType: "startup-directory",
  },
  {
    name: "Manufacturing World Tokyo",
    country: "Japan",
    city: "Tokyo",
    venue: "Tokyo Big Sight",
    url: "https://www.manufacturing-world.jp/tokyo/en-gb.html",
    sourceType: "official-event",
  },
  {
    name: "Japan IT Week",
    country: "Japan",
    city: "Tokyo",
    url: "https://www.japan-it.jp/hub/en-gb.html",
    sourceType: "official-event",
  },
  {
    name: "NexTech Week Tokyo",
    country: "Japan",
    city: "Tokyo",
    url: "https://www.nextech-week.jp/hub/en-gb.html",
    sourceType: "official-event",
  },

  {
    name: "CES",
    country: "United States",
    city: "Las Vegas",
    url: "https://www.ces.tech",
    sourceType: "official-event",
  },
  {
    name: "NVIDIA GTC",
    country: "United States",
    url: "https://www.nvidia.com/gtc/",
    sourceType: "official-event",
  },
  {
    name: "The AI Conference",
    country: "United States",
    url: "https://aiconference.com",
    sourceType: "official-event",
  },
  {
    name: "Startup Grind Global Conference",
    country: "United States",
    url: "https://www.startupgrind.com/conference/",
    sourceType: "startup-directory",
  },
  {
    name: "WeAreDevelopers Events",
    country: "Global",
    url: "https://www.wearedevelopers.com/events",
    sourceType: "conference-directory",
  },
  {
    name: "DevEvents",
    country: "Global",
    url: "https://dev.events",
    sourceType: "conference-directory",
  },
  {
    name: "Conference Radar",
    country: "Global",
    url: "https://conferenceradar.com",
    sourceType: "conference-directory",
  },
  {
    name: "10times Technology Events",
    country: "Global",
    url: "https://10times.com/technology",
    sourceType: "conference-directory",
  },
];

export function getSourcesForCountry(country?: string | null) {
  const normalized = normalizeCountry(country);

  if (!country || normalized === "Global") {
    return EVENT_SOURCES;
  }

  return EVENT_SOURCES.filter(
    (source) => source.country === normalized || source.country === "Global"
  );
}

export function looksLikeITEvent(text: string) {
  const lower = text.toLowerCase();

  return IT_EVENT_KEYWORDS.some((keyword) =>
    lower.includes(keyword.toLowerCase())
  );
}
