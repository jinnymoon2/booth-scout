import fs from "node:fs";
import path from "node:path";

export type ManualTechEvent = {
  title: string;
  country: "Korea" | "Japan" | "United States" | "Global";
  city?: string;
  venue?: string;
  sourceName: string;
  sourceUrl: string;
  url: string;
  description: string;
  tags: string[];
  category?: string;
  resultType?: "curated" | "searched" | "scraped" | "manual";
  lastVerified?: string;
  startDate: string;
  endDate: string;
};

function isManualTechEvent(value: unknown): value is ManualTechEvent {
  if (!value || typeof value !== "object") return false;

  const event = value as Partial<ManualTechEvent>;

  return Boolean(
    event.title &&
      event.country &&
      event.sourceName &&
      event.sourceUrl &&
      event.url &&
      event.description &&
      Array.isArray(event.tags) &&
      event.startDate &&
      event.endDate
  );
}

export function loadManualEvents(): ManualTechEvent[] {
  const filePath = path.join(process.cwd(), "data", "manual-events.json");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isManualTechEvent);
  } catch {
    return [];
  }
}
