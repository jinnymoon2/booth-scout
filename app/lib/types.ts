export type BoothStatus = "open" | "waitlist" | "sold_out" | "closed" | "unknown";

export type CostBand =
  | "free"
  | "under_2k"
  | "2k_to_5k"
  | "5k_to_15k"
  | "15k_to_50k"
  | "50k_plus"
  | "contact";

export type EventFormat = "expo" | "conference" | "meetup" | "hybrid";

export type Audience =
  | "developers"
  | "infra"
  | "ai_ml"
  | "devrel"
  | "marketers"
  | "founders"
  | "mixed";

export type Region = "us" | "japan" | "korea" | "europe" | "global";

export type PriceConfidence = "verified" | "estimated" | "contact_only";

export interface BoothEvent {
  id: string;
  slug: string;
  name: string;
  organizer: string;
  city: string;
  country: string;
  region: Region;
  venue: string;
  startDate: string; // ISO
  endDate: string; // ISO
  applicationDeadline: string | null; // ISO
  boothStatus: BoothStatus;
  costBand: CostBand;
  costMinUsd: number | null;
  costMaxUsd: number | null;
  priceConfidence: PriceConfidence;
  format: EventFormat;
  audiences: Audience[];
  expectedAttendees: number | null;
  exhibitPageUrl: string;
  homepageUrl: string;
  summary: string;
  highlights: string[];
  lastVerifiedAt: string; // ISO
  source: "seed" | "organizer_submission" | "scrape";
  featured?: boolean;
}

export interface EventFilters {
  q?: string;
  region?: Region[];
  format?: EventFormat[];
  audience?: Audience[];
  status?: BoothStatus[];
  costMax?: CostBand;
  startFrom?: string;
  startTo?: string;
}

export interface SavedFilter {
  id: string;
  email: string;
  name: string | null;
  filters: EventFilters;
  createdAt: string;
  active: boolean;
  lastSentAt: string | null;
}

export interface EventSubmission {
  id: string;
  eventName: string;
  organizer: string;
  contactEmail: string;
  homepageUrl: string;
  exhibitPageUrl: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export const BOOTH_STATUS_LABELS: Record<BoothStatus, string> = {
  open: "Booths open",
  waitlist: "Waitlist",
  sold_out: "Sold out",
  closed: "Closed",
  unknown: "Status unknown",
};

export const COST_BAND_LABELS: Record<CostBand, string> = {
  free: "Free",
  under_2k: "Under $2k",
  "2k_to_5k": "$2k - $5k",
  "5k_to_15k": "$5k - $15k",
  "15k_to_50k": "$15k - $50k",
  "50k_plus": "$50k+",
  contact: "Contact for price",
};

export const COST_BAND_ORDER: CostBand[] = [
  "free",
  "under_2k",
  "2k_to_5k",
  "5k_to_15k",
  "15k_to_50k",
  "50k_plus",
  "contact",
];

export const FORMAT_LABELS: Record<EventFormat, string> = {
  expo: "Expo floor",
  conference: "Conference",
  meetup: "Meetup",
  hybrid: "Hybrid",
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
  developers: "Developers",
  infra: "Infra / SRE",
  ai_ml: "AI / ML",
  devrel: "DevRel",
  marketers: "Marketers",
  founders: "Founders",
  mixed: "Mixed",
};

export const REGION_LABELS: Record<Region, string> = {
  us: "United States",
  japan: "Japan",
  korea: "Korea",
  europe: "Europe",
  global: "Global / online",
};

export function isExhibitorFriendly(format: EventFormat) {
  return format === "expo" || format === "hybrid";
}

export function costBandCeiling(c: CostBand): number | null {
  switch (c) {
    case "free":
      return 0;
    case "under_2k":
      return 2000;
    case "2k_to_5k":
      return 5000;
    case "5k_to_15k":
      return 15000;
    case "15k_to_50k":
      return 50000;
    case "50k_plus":
      return null;
    case "contact":
      return null;
  }
}
