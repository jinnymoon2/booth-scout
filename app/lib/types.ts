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
  application_deadline: string | null;
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
