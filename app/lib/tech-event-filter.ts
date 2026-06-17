export type EventLike = {
  title?: string | null;
  name?: string | null;
  description?: string | null;
  summary?: string | null;
  category?: string | null;
  tags?: string[] | string | null;
  venue?: string | null;
  location?: string | null;
  organizer?: string | null;
  source?: string | null;
  url?: string | null;
  country?: string | null;
};

function asText(value: unknown): string {
  if (Array.isArray(value)) return value.join(" ");
  if (value === null || value === undefined) return "";
  return String(value);
}

export function normalizeText(value: unknown): string {
  return asText(value)
    .toLowerCase()
    .replace(/[_\-–—/|()[\]{}:;,.!?'"`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCountry(country: unknown): string {
  const raw = asText(country).trim();
  const normalized = normalizeText(raw);

  if (
    normalized === "south korea" ||
    normalized === "republic of korea" ||
    normalized === "rok" ||
    normalized === "korea republic of" ||
    normalized === "대한민국" ||
    normalized === "한국"
  ) {
    return "Korea";
  }

  if (normalized === "korea") return "Korea";

  return raw || "Unknown";
}

const STRONG_TECH_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "generative ai",
  "genai",
  "llm",
  "machine learning",
  "deep learning",
  "data science",
  "big data",
  "cloud",
  "aws",
  "azure",
  "google cloud",
  "gcp",
  "devops",
  "developer",
  "developers",
  "software",
  "programming",
  "coding",
  "open source",
  "github",
  "cybersecurity",
  "security",
  "infosec",
  "zero trust",
  "sase",
  "network",
  "networking",
  "server",
  "database",
  "db",
  "saas",
  "api",
  "blockchain",
  "web3",
  "fintech",
  "semiconductor",
  "chip",
  "robotics",
  "iot",
  "internet of things",
  "smart tech",
  "digital transformation",
  "dx",
  "metaverse",
  "startup tech",
  "hr tech",
  "edtech",
  "healthtech",
  "medtech",
  "mobility tech",
  "autonomous",
  "quantum",
  "electronics",
  "ict",
  "it show",
  "tech conference",
  "technology conference",
  "tech expo",
  "software expo",
  "digital expo",

  "인공지능",
  "생성형 ai",
  "머신러닝",
  "딥러닝",
  "데이터",
  "빅데이터",
  "클라우드",
  "개발자",
  "개발",
  "프로그래밍",
  "코딩",
  "오픈소스",
  "깃허브",
  "보안",
  "사이버보안",
  "정보보안",
  "네트워크",
  "서버",
  "데이터베이스",
  "블록체인",
  "핀테크",
  "반도체",
  "로봇",
  "로보틱스",
  "사물인터넷",
  "스마트테크",
  "디지털 전환",
  "메타버스",
  "스타트업",
  "양자",
  "전자",
  "ict",
  "it",
  "소프트웨어",
  "테크",
];

const KNOWN_TECH_EVENT_PHRASES = [
  "world it show",
  "ai expo korea",
  "smart tech korea",
  "semicon korea",
  "korea electronics show",
  "korea it expo",
  "seoul ai hub",
  "next rise",
  "try everything",
  "k global",
  "korea cloud",
  "security korea",
  "secon",
  "seoul cyber security",
  "aws summit",
  "google cloud summit",
  "microsoft ai tour",
  "naver cloud",
  "deview",
  "if kakao",
  "samsung developer conference",

  "월드IT쇼",
  "월드 it 쇼",
  "스마트테크 코리아",
  "AI EXPO KOREA",
  "국제인공지능대전",
  "세미콘 코리아",
  "한국전자전",
  "넥스트라이즈",
  "시큐리티코리아",
  "정보보호",
  "데뷰",
  "이프카카오",
];

const WEAK_TECH_KEYWORDS = [
  "innovation",
  "future",
  "startup",
  "venture",
  "conference",
  "expo",
  "summit",
  "forum",
  "show",
  "fair",
  "business",
  "b2b",
  "enterprise",
  "platform",
  "solution",
  "automation",
  "smart",
  "digital",

  "혁신",
  "미래",
  "스타트업",
  "벤처",
  "컨퍼런스",
  "박람회",
  "엑스포",
  "전시회",
  "포럼",
  "쇼",
  "비즈니스",
  "기업",
  "플랫폼",
  "솔루션",
  "자동화",
  "스마트",
  "디지털",
];

const NON_TECH_KEYWORDS = [
  "wedding",
  "bridal",
  "baby",
  "kids",
  "mom",
  "pet",
  "dog",
  "cat",
  "food",
  "coffee",
  "bakery",
  "beer",
  "wine",
  "beauty",
  "cosmetic",
  "fashion",
  "jewelry",
  "interior",
  "furniture",
  "home living",
  "flower",
  "art fair",
  "gallery",
  "painting",
  "music",
  "concert",
  "travel",
  "tourism",
  "hotel",
  "franchise",
  "education fair",
  "study abroad",
  "language",
  "book fair",
  "comic",
  "anime",
  "game festival",
  "religion",
  "church",
  "temple",
  "health food",
  "diet",
  "fitness",
  "golf",
  "sports",
  "caravan",
  "camping",
  "leisure",
  "real estate",
  "housing",
  "construction",
  "architecture",
  "medical fair",
  "hospital",
  "dental",

  "웨딩",
  "결혼",
  "혼수",
  "베이비",
  "유아",
  "키즈",
  "맘",
  "펫",
  "강아지",
  "고양이",
  "푸드",
  "식품",
  "커피",
  "베이커리",
  "맥주",
  "와인",
  "뷰티",
  "화장품",
  "패션",
  "쥬얼리",
  "주얼리",
  "인테리어",
  "가구",
  "리빙",
  "꽃",
  "화훼",
  "미술",
  "갤러리",
  "음악",
  "콘서트",
  "여행",
  "관광",
  "호텔",
  "프랜차이즈",
  "유학",
  "어학",
  "도서",
  "만화",
  "애니",
  "종교",
  "교회",
  "사찰",
  "건강식품",
  "다이어트",
  "피트니스",
  "골프",
  "스포츠",
  "캠핑",
  "레저",
  "부동산",
  "건축",
  "병원",
  "치과",
];

function includesPhrase(text: string, phrase: string): boolean {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return false;

  if (/^[a-z0-9가-힣+#.]+$/i.test(normalizedPhrase)) {
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}(\\s|$)`, "i").test(text);
  }

  return text.includes(normalizedPhrase);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getEventText(event: EventLike): {
  titleText: string;
  fullText: string;
} {
  const titleText = normalizeText(`${event.title ?? ""} ${event.name ?? ""}`);

  const fullText = normalizeText([
    event.title,
    event.name,
    event.description,
    event.summary,
    event.category,
    event.tags,
    event.venue,
    event.location,
    event.organizer,
    event.source,
    event.url,
  ].join(" "));

  return { titleText, fullText };
}

export function getTechnologyScore(event: EventLike): number {
  const { titleText, fullText } = getEventText(event);

  let score = 0;

  for (const phrase of KNOWN_TECH_EVENT_PHRASES) {
    if (includesPhrase(fullText, phrase)) score += 8;
  }

  for (const keyword of STRONG_TECH_KEYWORDS) {
    if (includesPhrase(titleText, keyword)) score += 4;
    else if (includesPhrase(fullText, keyword)) score += 2;
  }

  for (const keyword of WEAK_TECH_KEYWORDS) {
    if (includesPhrase(titleText, keyword)) score += 1.5;
    else if (includesPhrase(fullText, keyword)) score += 0.5;
  }

  for (const keyword of NON_TECH_KEYWORDS) {
    if (includesPhrase(titleText, keyword)) score -= 5;
    else if (includesPhrase(fullText, keyword)) score -= 3;
  }

  return score;
}

export function isTechnologyEvent(event: EventLike): boolean {
  const { titleText, fullText } = getEventText(event);
  const score = getTechnologyScore(event);

  const hasKnownTechPhrase = KNOWN_TECH_EVENT_PHRASES.some((phrase) =>
    includesPhrase(fullText, phrase)
  );

  const hasStrongTechInTitle = STRONG_TECH_KEYWORDS.some((keyword) =>
    includesPhrase(titleText, keyword)
  );

  const hasNonTechInTitle = NON_TECH_KEYWORDS.some((keyword) =>
    includesPhrase(titleText, keyword)
  );

  if (hasKnownTechPhrase) return true;

  if (hasNonTechInTitle && score < 4) return false;

  if (hasStrongTechInTitle && score >= 2) return true;

  return score >= 3;
}

export function normalizeEventForDisplay<T extends EventLike>(event: T): T {
  return {
    ...event,
    country: normalizeCountry(event.country),
  };
}

export function filterTechnologyEvents<T extends EventLike>(events: T[]): T[] {
  return events
    .map(normalizeEventForDisplay)
    .filter((event) => isTechnologyEvent(event));
}
