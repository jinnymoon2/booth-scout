export type BoothStatus = "open" | "waitlist" | "sold_out" | "unknown";

export type EventFormat =
  | "expo_networking"
  | "conference_sessions"
  | "mixed"
  | "unknown";

export type EventCategory =
  | "general_it"
  | "developer_tools"
  | "cloud_infrastructure"
  | "cybersecurity"
  | "ai_data"
  | "devops_sre"
  | "networking_infrastructure"
  | "enterprise_software"
  | "saas"
  | "startup_tech"
  | "hardware_iot"
  | "fintech_it"
  | "healthtech_it"
  | "education_tech"
  | "mixed"
  | "unknown";

export type AudienceType =
  | "developers"
  | "it_decision_makers"
  | "security_professionals"
  | "cloud_infra_engineers"
  | "data_ai_teams"
  | "network_engineers"
  | "enterprise_tech_buyers"
  | "startup_founders"
  | "marketers"
  | "mixed"
  | "unknown";

export type BoothEvent = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  sponsor_url: string | null;
  country: string;
  city: string | null;
  region: string | null;
  venue: string | null;
  start_date: string;
  end_date: string | null;
  booth_status: BoothStatus;
  booth_price_min: number | null;
  booth_price_max: number | null;
  booth_price_currency: string | null;
  price_visibility: string;
  event_format: EventFormat;
  event_category: EventCategory | null;
  audience_type: AudienceType;
  estimated_attendees: number | null;
  source_url: string | null;
  verified_status: string;
  last_verified_at: string | null;
};


export type EventFilters = {
  q?: string;
  query?: string;
  search?: string;

  region?: Region[];
  regions?: Region[];

  format?: EventFormat[];
  formats?: EventFormat[];

  audience?: Audience[];
  audiences?: Audience[];

  status?: BoothStatus[];
  statuses?: BoothStatus[];
  boothStatus?: BoothStatus[];
  boothStatuses?: BoothStatus[];

  cost?: CostBand[];
  costs?: CostBand[];
  costBand?: CostBand[];
  costBands?: CostBand[];

  country?: string;
  countries?: string[];

  category?: string;
  categories?: string[];

  tags?: string[];

  venue?: string;
  location?: string;
  source?: string;

  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  from?: string;
  to?: string;

  techOnly?: boolean;
  upcomingOnly?: boolean;

  costMin?: string;
  costMax?: string;
  startFrom?: string;
  startTo?: string;
  page?: string;
  sort?: string;

  [key: string]: unknown;
};


export type SavedFilter = {
  id: string;
  name?: string | null;
  filters: EventFilters;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  active?: boolean;
  lastSentAt?: string | null;
  last_sent_at?: string | null;
};

export const BOOTH_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  available: "Available",
  limited: "Limited",
  waitlist: "Waitlist",
  sold_out: "Sold out",
  closed: "Closed",
  unknown: "Unknown",
};


export const COST_BAND_LABELS: Record<string, string> = {
  free: "Free",
  low: "Low cost",
  medium: "Medium cost",
  high: "High cost",
  premium: "Premium",
  unknown: "Unknown",
};

export type CostBand =
  | "free"
  | "low"
  | "medium"
  | "high"
  | "premium"
  | "unknown";

export type Region =
  | "Korea"
  | "Japan"
  | "America"
  | "Asia"
  | "North America"
  | "Global"
  | "Unknown";


export const EVENT_FORMAT_LABELS: Record<string, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
  unknown: "Unknown",
};


export const REGION_LABELS: Record<string, string> = {
  Korea: "Korea",
  Japan: "Japan",
  America: "America",
  Asia: "Asia",
  "North America": "North America",
  Global: "Global",
  Unknown: "Unknown",
};


export type Audience =
  | "developers"
  | "startups"
  | "enterprise"
  | "investors"
  | "researchers"
  | "students"
  | "marketers"
  | "product"
  | "designers"
  | "founders"
  | "general"
  | "unknown";


export const AUDIENCE_LABELS: Record<string, string> = {
  developers: "Developers",
  startups: "Startups",
  enterprise: "Enterprise",
  investors: "Investors",
  researchers: "Researchers",
  students: "Students",
  marketers: "Marketers",
  product: "Product",
  designers: "Designers",
  founders: "Founders",
  general: "General",
  unknown: "Unknown",
};


export function costBandCeiling(costBand?: string | null): number | null {
  if (!costBand) return null;

  const normalized = String(costBand).toLowerCase();

  const values: Record<string, number> = {
    free: 0,
    low: 1000,
    medium: 5000,
    high: 10000,
    premium: 25000,
    unknown: 0,
  };

  return values[normalized] ?? null;
}
