export type GlobalTechSource = {
  id: string;
  title: string;
  description: string;
  country: "Korea" | "Japan" | "America";
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

export function normalizeGlobalCountry(country: unknown): string {
  const raw = String(country || "").trim();
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

  if (
    lower === "japan" ||
    raw === "日本" ||
    raw === "일본"
  ) {
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

export const GLOBAL_TECH_SOURCES: GlobalTechSource[] = [
  // Korea
  {
    id: "coex-calendar",
    title: "COEX Event Calendar",
    description:
      "Major Seoul exhibition venue for AI, smart tech, robotics, software, startup, enterprise, and IT exhibitions.",
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
      "Large exhibition and convention center in Goyang. Important for IT, mobility, electronics, security, industrial tech, and manufacturing technology events outside COEX.",
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
      "Seoul trade exhibition center for B2B, startup, digital business, software, and industry-specific events.",
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
      "Busan convention center for regional technology, smart city, cloud, startup, gaming, AI, and industry events.",
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
      "Daegu convention center for robotics, electronics, manufacturing tech, mobility, medical tech, and regional technology events.",
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

  // Japan
  {
    id: "tokyo-big-sight-events",
    title: "Tokyo Big Sight Event Calendar",
    description:
      "Tokyo International Exhibition Center event calendar. Useful for electronics, manufacturing, software, AI, enterprise, industrial tech, and trade exhibitions in Japan.",
    country: "Japan",
    location: "Tokyo",
    venue: "Tokyo Big Sight",
    city: "Tokyo",
    category: "Technology Event Source",
    tags: ["Tokyo Big Sight", "Tokyo", "Electronics", "Manufacturing", "AI", "Trade Show"],
    url: "https://www.bigsight.jp/english/visitor/event/",
    source: "Tokyo Big Sight",
    source_kind: "venue",
    priority: 95,
  },
  {
    id: "makuhari-messe-events",
    title: "Makuhari Messe Event Calendar",
    description:
      "Large convention venue near Tokyo. Important for Interop Tokyo, AI-native infrastructure, enterprise IT, cloud, network, gaming, and electronics events.",
    country: "Japan",
    location: "Chiba",
    venue: "Makuhari Messe",
    city: "Chiba",
    category: "Technology Event Source",
    tags: ["Makuhari Messe", "Interop", "Cloud", "Network", "Enterprise IT", "AI"],
    url: "https://www.m-messe.co.jp/en/",
    source: "Makuhari Messe",
    source_kind: "venue",
    priority: 94,
  },
  {
    id: "sushi-tech-tokyo",
    title: "SusHi Tech Tokyo",
    description:
      "Tokyo global innovation conference for startups, sustainable cities, urban technology, investors, and startup ecosystem builders.",
    country: "Japan",
    location: "Tokyo",
    city: "Tokyo",
    category: "Startup / Innovation Conference",
    tags: ["Startup", "Innovation", "Tokyo", "Urban Tech", "Sustainable City", "VC"],
    url: "https://sushitech-startup.metro.tokyo.lg.jp/en/",
    source: "SusHi Tech Tokyo",
    source_kind: "conference",
    priority: 98,
  },
  {
    id: "manufacturing-world-tokyo",
    title: "Manufacturing World Tokyo",
    description:
      "Japan manufacturing technology exhibition covering industrial DX, CAD, engineering, factory automation, manufacturing IT, and product development.",
    country: "Japan",
    location: "Tokyo",
    city: "Tokyo",
    category: "Manufacturing Technology Exhibition",
    tags: ["Manufacturing", "DX", "Factory Automation", "CAD", "Engineering", "Industrial Tech"],
    url: "https://www.manufacturing-world.jp/tokyo/en-gb/about.html",
    source: "Manufacturing World Tokyo",
    source_kind: "event",
    priority: 90,
  },
  {
    id: "dev-events-tokyo",
    title: "Developer Conferences in Tokyo",
    description:
      "Developer conference directory for Tokyo. Useful for AI, web, security, software engineering, web3, cloud, and developer community events.",
    country: "Japan",
    location: "Tokyo",
    city: "Tokyo",
    category: "Developer Conference Directory",
    tags: ["Developer", "Software", "AI", "Web", "Security", "Cloud", "Tokyo"],
    url: "https://dev.events/AS/JP/Tokyo",
    source: "dev.events",
    source_kind: "directory",
    priority: 89,
  },

  // America
  {
    id: "wearedevelopers-north-america",
    title: "WeAreDevelopers World Congress North America",
    description:
      "Developer, AI builder, and tech leader event in San Jose, California with developers, companies, decision-makers, speakers, and a tech expo.",
    country: "America",
    location: "San Jose, California",
    venue: "San Jose",
    city: "San Jose",
    category: "Developer / AI Conference",
    tags: ["Developer", "AI", "Tech Leaders", "Software", "San Jose", "Conference"],
    url: "https://www.wearedevelopers.com/world-congress-north-america",
    source: "WeAreDevelopers",
    source_kind: "conference",
    priority: 98,
  },
  {
    id: "the-ai-conference-sf",
    title: "The AI Conference",
    description:
      "San Francisco AI conference for builders, researchers, applied AI teams, and technology leaders.",
    country: "America",
    location: "San Francisco, California",
    city: "San Francisco",
    category: "AI Conference",
    tags: ["AI", "Applied AI", "San Francisco", "Builders", "Researchers", "LLM"],
    url: "https://aiconference.com/",
    source: "The AI Conference",
    source_kind: "conference",
    priority: 97,
  },
  {
    id: "startup-grind-conference",
    title: "Startup Grind Conference",
    description:
      "Silicon Valley startup conference for founders, startups, investors, operators, and technology ecosystem builders.",
    country: "America",
    location: "Silicon Valley, California",
    city: "Silicon Valley",
    category: "Startup / Technology Conference",
    tags: ["Startup", "Founder", "Investor", "Silicon Valley", "VC", "Tech"],
    url: "https://www.startupgrind.tech/",
    source: "Startup Grind",
    source_kind: "conference",
    priority: 95,
  },
  {
    id: "nvidia-gtc",
    title: "NVIDIA GTC",
    description:
      "AI and accelerated computing conference for machine learning, AI infrastructure, robotics, data center, simulation, and developer ecosystems.",
    country: "America",
    location: "San Jose, California",
    city: "San Jose",
    category: "AI / Accelerated Computing Conference",
    tags: ["NVIDIA", "AI", "GPU", "Machine Learning", "Accelerated Computing", "Developer"],
    url: "https://www.nvidia.com/gtc/",
    source: "NVIDIA GTC",
    source_kind: "conference",
    priority: 96,
  },
  {
    id: "dev-events-north-america",
    title: "Developer Conferences in North America",
    description:
      "Developer conference directory for North America. Useful for software engineering, AI, security, cloud, open source, database, DevOps, and web events.",
    country: "America",
    location: "North America",
    category: "Developer Conference Directory",
    tags: ["Developer", "Software", "AI", "Security", "Cloud", "Open Source", "DevOps"],
    url: "https://dev.events/NA",
    source: "dev.events",
    source_kind: "directory",
    priority: 88,
  },
  {
    id: "ces",
    title: "CES",
    description:
      "Major consumer technology and innovation event in Las Vegas covering AI, mobility, hardware, robotics, consumer electronics, and startup technologies.",
    country: "America",
    location: "Las Vegas, Nevada",
    city: "Las Vegas",
    category: "Consumer Technology Exhibition",
    tags: ["CES", "Consumer Tech", "AI", "Hardware", "Robotics", "Mobility", "Startup"],
    url: "https://www.ces.tech/",
    source: "CES",
    source_kind: "event",
    priority: 94,
  },
];

export function getGlobalTechSourceCards(country?: string | null) {
  const normalizedCountry = normalizeGlobalCountry(country);

  return GLOBAL_TECH_SOURCES
    .filter((source) => {
      if (!country || country === "all") return true;
      return source.country === normalizedCountry;
    })
    .map((source) => ({
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
