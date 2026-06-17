// Pure helpers that translate URL search params into the EventFilters
// shape and back. Kept tiny so they can be reused on the server and
// in the client filter form.

import type {
  BoothStatus,
  CostBand,
  EventFilters,
  EventFormat,
  Region,
  Audience,
} from "./types";
import { costBandCeiling } from "./types";

export function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): EventFilters {
  const multi = (k: string): string[] | undefined => {
    const v = sp[k];
    if (!v) return undefined;
    return Array.isArray(v) ? v : v.split(",").filter(Boolean);
  };
  const single = (k: string): string | undefined => {
    const v = sp[k];
    if (!v || Array.isArray(v)) return undefined;
    return v;
  };
  return {
    q: single("q"),
    region: multi("region") as Region[] | undefined,
    format: multi("format") as EventFormat[] | undefined,
    audience: multi("audience") as Audience[] | undefined,
    status: multi("status") as BoothStatus[] | undefined,
    costMax: single("costMax") as CostBand | undefined,
    startFrom: single("startFrom"),
    startTo: single("startTo"),
  };
}

export function hasActiveFilters(f: EventFilters): boolean {
  return Boolean(
    f.q ||
      f.region?.length ||
      f.format?.length ||
      f.audience?.length ||
      f.status?.length ||
      f.costMax ||
      f.startFrom ||
      f.startTo,
  );
}

export function buildQueryString(
  current: EventFilters,
  patch: Partial<EventFilters> & { reset?: boolean },
): string {
  const merged: EventFilters = patch.reset
    ? {}
    : { ...current, ...patch };
  const params = new URLSearchParams();
  const put = (k: string, v: string | string[] | undefined) => {
    if (v == null) return;
    if (Array.isArray(v)) {
      if (v.length === 0) return;
      params.set(k, v.join(","));
    } else if (v !== "") {
      params.set(k, v);
    }
  };
  put("q", merged.q);
  put("region", merged.region);
  put("format", merged.format);
  put("audience", merged.audience);
  put("status", merged.status);
  put("costMax", merged.costMax);
  put("startFrom", merged.startFrom);
  put("startTo", merged.startTo);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function summarizeFilters(f: EventFilters): string[] {
  const out: string[] = [];
  if (f.q) out.push(`Search: "${f.q}"`);
  if (f.region?.length) out.push(`Region: ${f.region.length}`);
  if (f.format?.length) out.push(`Format: ${f.format.length}`);
  if (f.audience?.length) out.push(`Audience: ${f.audience.length}`);
  if (f.status?.length) out.push(`Status: ${f.status.length}`);
  if (f.costMax) {
    const c = costBandCeiling(f.costMax);
    out.push(c == null ? "Cost: any" : `Cost up to $${c.toLocaleString()}`);
  }
  if (f.startFrom) out.push(`From: ${f.startFrom}`);
  if (f.startTo) out.push(`To: ${f.startTo}`);
  return out;
}
