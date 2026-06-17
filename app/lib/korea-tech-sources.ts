export type KoreaTechSource = {
  id: string;
  title: string;
  description: string;
  country: "Korea";
  location: string;
  venue?: string;
  city?: string;
  category: string;
  tags: string[];
  url: string;
  source: string;
  source_kind: "event" | "venue" | "directory" | "festival" | "conference";
  priority: number;
};

export const KOREA_TECH_SOURCES: KoreaTechSource[] = [
  {
    id: "coex-calendar",
    title: "COEX Event Calendar",
    description:
      "Major Seoul exhibition venue. Useful for AI, smart tech, retail tech, robotics, IT, startup, and enterprise exhibitions.",
    country: "Korea",
    location: "Gangnam-gu, Seoul",
    venue: "COEX",
    city: "Seoul",
    category: "Technology Event Source",
    tags: ["COEX", "AI", "Smart Tech", "Robotics", "Startup", "Enterprise"],
    url: "https://www.coexcenter.com/event-calendar/",
    source: "COEX",
    source_kind: "venue",
    priority: 95,
  },
  {
    id: "kintex-events",
    title: "KINTEX Event Calendar",
    description:
      "Large exhibition and convention center in Goyang. Important source for events outside COEX, including IT, mobility, manufacturing tech, electronics, security, and industrial technology.",
    country: "Korea",
    location: "Goyang, Gyeonggi-do",
    venue: "KINTEX",
    city: "Goyang",
    category: "Technology Event Source",
    tags: ["KINTEX", "IT", "Mobility", "Manufacturing Tech", "Electronics", "Security"],
    url: "https://www.kintex.com/web/en/event/list.do",
    source: "KINTEX",
    source_kind: "venue",
    priority: 94,
  },
  {
    id: "setec-events",
    title: "SETEC Event Calendar",
    description:
      "Seoul trade exhibition center. Useful for smaller B2B, startup, digital business, franchise tech, software, and industry-specific events outside COEX.",
    country: "Korea",
    location: "Gangnam-gu, Seoul",
    venue: "SETEC",
    city: "Seoul",
    category: "Technology Event Source",
    tags: ["SETEC", "B2B", "Startup", "Software", "Digital Business"],
    url: "https://www.setec.or.kr",
    source: "SETEC",
    source_kind: "venue",
    priority: 88,
  },
  {
    id: "bexco-events",
    title: "BEXCO Event Calendar",
    description:
      "Busan exhibition and convention center. Useful for regional technology, smart city, maritime tech, startup, AI, gaming, cloud, and industry events outside Seoul.",
    country: "Korea",
    location: "Busan",
    venue: "BEXCO",
    city: "Busan",
    category: "Technology Event Source",
    tags: ["BEXCO", "Busan", "Smart City", "AI", "Cloud", "Startup", "Gaming"],
    url: "https://www.bexco.co.kr",
    source: "BEXCO",
    source_kind: "venue",
    priority: 87,
  },
  {
    id: "exco-events",
    title: "EXCO Event Calendar",
    description:
      "Daegu exhibition and convention center. Useful for robotics, electronics, manufacturing tech, mobility, medical tech, and regional tech events.",
    country: "Korea",
    location: "Daegu",
    venue: "EXCO",
    city: "Daegu",
    category: "Technology Event Source",
    tags: ["EXCO", "Daegu", "Robotics", "Electronics", "Manufacturing Tech", "Mobility"],
    url: "https://www.exco.co.kr",
    source: "EXCO",
    source_kind: "venue",
    priority: 86,
  },
  {
    id: "ddp-events",
    title: "DDP Event Calendar",
    description:
      "Seoul design and culture venue. Useful for design-tech, digital media, creative technology, UX, product design, and startup showcases.",
    country: "Korea",
    location: "Jung-gu, Seoul",
    venue: "DDP",
    city: "Seoul",
    category: "Technology Event Source",
    tags: ["DDP", "Design Tech", "Digital Media", "UX", "Product Design", "Startup"],
    url: "https://ddp.or.kr",
    source: "DDP",
    source_kind: "venue",
    priority: 78,
  },
  {
    id: "ai-expo-korea",
    title: "AI EXPO KOREA",
    description:
      "Korea AI exhibition focused on artificial intelligence, enterprise AI, AI infrastructure, and AI business applications.",
    country: "Korea",
    location: "Seoul",
    venue: "COEX",
    city: "Seoul",
    category: "AI / Technology Exhibition",
    tags: ["AI", "Artificial Intelligence", "Enterprise AI", "Data", "B2B"],
    url: "https://www.aiexpo.co.kr/en/i1.php?s=11",
    source: "AI EXPO KOREA",
    source_kind: "event",
    priority: 99,
  },
  {
    id: "smart-tech-korea",
    title: "Smart Tech Korea",
    description:
      "Korea technology business exhibition covering smart tech, AI, big data, retail tech, logistics tech, robotics, and digital transformation.",
    country: "Korea",
    location: "Seoul",
    venue: "COEX",
    city: "Seoul",
    category: "Smart Technology Exhibition",
    tags: ["Smart Tech", "AI", "Big Data", "Retail Tech", "Logistics Tech", "Robotics"],
    url: "https://en.smarttechkorea.com/smarttechshow",
    source: "Smart Tech Korea",
    source_kind: "event",
    priority: 98,
  },
  {
    id: "nextrise-seoul",
    title: "NextRise Seoul",
    description:
      "Startup and innovation event with exhibitions, conferences, business meetups, startups, investors, accelerators, and enterprise partners.",
    country: "Korea",
    location: "Seoul",
    city: "Seoul",
    category: "Startup / Technology Conference",
    tags: ["Startup", "VC", "Accelerator", "Innovation", "Enterprise", "Tech"],
    url: "https://www.nextrise.co.kr/en",
    source: "NextRise",
    source_kind: "festival",
    priority: 96,
  },
  {
    id: "try-everything",
    title: "Try Everything",
    description:
      "Global startup festival in Seoul for startups, investors, accelerators, corporates, and startup ecosystem builders.",
    country: "Korea",
    location: "Seoul",
    city: "Seoul",
    category: "Startup / Technology Festival",
    tags: ["Startup", "VC", "Accelerator", "Seoul", "Innovation", "Tech"],
    url: "https://www.tryeverything.or.kr/",
    source: "Try Everything",
    source_kind: "festival",
    priority: 93,
  },
  {
    id: "international-conference-alerts-it-seoul",
    title: "Information Technology Conferences in Seoul",
    description:
      "Conference directory for IT-related academic and professional conferences in Seoul. Useful for finding smaller events that do not appear on venue calendars.",
    country: "Korea",
    location: "Seoul",
    city: "Seoul",
    category: "Technology Conference Directory",
    tags: ["IT", "Conference", "Research", "Engineering", "Technology"],
    url: "https://internationalconferencealerts.com/conferences/seoul/information-technology",
    source: "International Conference Alerts",
    source_kind: "directory",
    priority: 82,
  },
  {
    id: "international-conference-alerts-ai-seoul",
    title: "Artificial Intelligence Conferences in Seoul",
    description:
      "Conference directory for AI-related events in Seoul. Useful for academic, research, engineering, and professional AI conferences.",
    country: "Korea",
    location: "Seoul",
    city: "Seoul",
    category: "AI Conference Directory",
    tags: ["AI", "Artificial Intelligence", "Conference", "Research", "Engineering"],
    url: "https://internationalconferencealerts.com/conferences/seoul/artificial-intelligence",
    source: "International Conference Alerts",
    source_kind: "directory",
    priority: 81,
  },
];

export function getKoreaTechSourceCards() {
  return KOREA_TECH_SOURCES.map((source) => ({
    id: `source-${source.id}`,
    title: source.title,
    description: source.description,
    category: source.category,
    tags: source.tags,
    venue: source.venue || "",
    location: source.location,
    country: source.country,
    start_date: null,
    end_date: null,
    date: null,
    organizer: source.source,
    source: source.source,
    url: source.url,
    image_url: null,
    source_kind: source.source_kind,
    result_type: "source",
    priority: source.priority,
  }));
}
