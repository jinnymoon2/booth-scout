export type FilterableEvent = {
  title?: string;
  description?: string;
  sourceName?: string;
  venue?: string;
  city?: string;
  country?: string;
  tags?: string[];
};

const STRONG_TECH_KEYWORDS = [
  "it",
  "information technology",
  "developer",
  "developers",
  "software",
  "programming",
  "coding",
  "engineer",
  "engineering",
  "devrel",
  "open source",
  "github",
  "api",
  "frontend",
  "backend",
  "full stack",
  "web development",
  "mobile development",
  "app development",

  "ai",
  "artificial intelligence",
  "generative ai",
  "genai",
  "machine learning",
  "deep learning",
  "llm",
  "agent",
  "agents",
  "mcp",
  "computer vision",
  "nlp",

  "startup",
  "startups",
  "founder",
  "founders",
  "venture",
  "vc",
  "accelerator",
  "demo day",
  "pitch",
  "saas",
  "b2b",

  "cloud",
  "aws",
  "azure",
  "google cloud",
  "kubernetes",
  "container",
  "containers",
  "docker",
  "devops",
  "platform engineering",
  "cloud native",
  "serverless",
  "infrastructure",
  "database",
  "data",
  "big data",
  "analytics",
  "data science",
  "data engineering",

  "cybersecurity",
  "cyber security",
  "security",
  "infosec",
  "zero trust",
  "network security",
  "application security",
  "cloud security",

  "semiconductor",
  "electronics",
  "hardware",
  "robotics",
  "robot",
  "iot",
  "edge computing",
  "embedded",
  "smart factory",
  "automation",
  "mobility",
  "autonomous",
  "digital transformation",
  "dx",
  "fintech",
  "healthtech",
  "medtech",
  "edtech",
  "blockchain",
  "web3",
  "quantum",
  "xr",
  "ar",
  "vr",

  "인공지능",
  "생성형 ai",
  "개발자",
  "소프트웨어",
  "프로그래밍",
  "코딩",
  "스타트업",
  "벤처",
  "클라우드",
  "데이터",
  "빅데이터",
  "사이버보안",
  "보안",
  "반도체",
  "로봇",
  "스마트팩토리",
  "자동화",
  "디지털전환",
  "블록체인",
  "핀테크",
  "헬스테크",
  "기술",
  "테크",
  "IT",

  "人工知能",
  "生成ai",
  "開発者",
  "ソフトウェア",
  "スタートアップ",
  "クラウド",
  "セキュリティ",
  "データ",
  "半導体",
  "ロボット",
  "dx",
];

const NON_TECH_EXCLUSION_KEYWORDS = [
  "pet",
  "dog",
  "cat",
  "animal",
  "zoo",
  "wedding",
  "bridal",
  "baby",
  "kids",
  "childcare",
  "franchise",
  "food",
  "beverage",
  "coffee",
  "wine",
  "beer",
  "restaurant",
  "bakery",
  "dessert",
  "hotel",
  "travel",
  "tourism",
  "cosmetics",
  "beauty",
  "aesthetic",
  "fashion",
  "jewelry",
  "art",
  "craft",
  "furniture",
  "interior",
  "home living",
  "housing",
  "real estate",
  "construction",
  "sports",
  "fitness",
  "golf",
  "music",
  "concert",
  "character licensing",
  "comic",
  "anime",
  "toy",
  "education fair",
  "study abroad",
  "language fair",
  "job fair",
  "career fair",

  "펫",
  "반려동물",
  "강아지",
  "고양이",
  "웨딩",
  "베이비",
  "프랜차이즈",
  "음식",
  "식품",
  "카페",
  "와인",
  "맥주",
  "화장품",
  "뷰티",
  "패션",
  "주얼리",
  "미술",
  "가구",
  "인테리어",
  "여행",
  "관광",
  "스포츠",
  "골프",
  "음악",
  "콘서트",
  "캐릭터",
  "애니메이션",
  "유학",
  "취업박람회",

  "ペット",
  "犬",
  "猫",
  "結婚",
  "フード",
  "食品",
  "美容",
  "ファッション",
  "家具",
  "旅行",
  "スポーツ",
  "音楽",
];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function isTechnologyRelatedText(text: string) {
  const normalized = normalize(text);

  if (!normalized) return false;

  const hasStrongTechKeyword = STRONG_TECH_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );

  if (!hasStrongTechKeyword) {
    return false;
  }

  const hasNonTechKeyword = NON_TECH_EXCLUSION_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );

  // If it has both, keep it only when the technology signal is clearly strong.
  // Example: "digital health" should stay, but "beauty fair" should not.
  if (hasNonTechKeyword) {
    const strongSignals = STRONG_TECH_KEYWORDS.filter((keyword) =>
      normalized.includes(keyword.toLowerCase())
    ).length;

    return strongSignals >= 2;
  }

  return true;
}

export function isTechnologyRelatedEvent(event: FilterableEvent) {
  const combined = [
    event.title,
    event.description,
    event.sourceName,
    event.venue,
    event.city,
    event.country,
    ...(event.tags || []),
  ]
    .filter(Boolean)
    .join(" ");

  return isTechnologyRelatedText(combined);
}
