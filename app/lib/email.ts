// Resend email helper. No-op if RESEND_API_KEY is missing so the app
// still works locally without an email provider.

import type { BoothEvent, SavedFilter } from "./types";
import { BOOTH_STATUS_LABELS, COST_BAND_LABELS } from "./types";

export const isResendConfigured = () => Boolean(process.env.RESEND_API_KEY);

export async function sendAlertEmail(
  filter: SavedFilter,
  events: BoothEvent[],
): Promise<{ sent: boolean; reason?: string }> {
  if (!isResendConfigured()) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }
  if (events.length === 0) {
    return { sent: false, reason: "no events to send" };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY as string);
  const from =
    process.env.ALERT_FROM_EMAIL ?? "BoothScout <alerts@boothscout.example>";
  const subject = `BoothScout: ${events.length} event${
    events.length === 1 ? "" : "s"
  } match your saved filter`;

  const html = renderAlertHtml(filter, events);
  const text = renderAlertText(filter, events);

  const { error } = await resend.emails.send({
    from,
    to: filter.email,
    subject,
    html,
    text,
  });
  if (error) {
    return { sent: false, reason: error.message };
  }
  return { sent: true };
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderAlertText(filter: SavedFilter, events: BoothEvent[]): string {
  const lines: string[] = [];
  lines.push("BoothScout alert", "");
  if (filter.name) lines.push(`Filter: ${filter.name}`);
  lines.push(`Matches: ${events.length}`);
  lines.push("");
  for (const e of events) {
    lines.push(`${e.name} - ${e.city}, ${e.country}`);
    lines.push(`  Dates: ${fmtDate(e.startDate)} - ${fmtDate(e.endDate)}`);
    lines.push(`  Booth status: ${BOOTH_STATUS_LABELS[e.boothStatus]}`);
    lines.push(`  Cost: ${COST_BAND_LABELS[e.costBand]}`);
    if (e.applicationDeadline) {
      lines.push(`  Application deadline: ${fmtDate(e.applicationDeadline)}`);
    }
    lines.push(`  Exhibit page: ${e.exhibitPageUrl}`);
    lines.push("");
  }
  return lines.join("\n");
}

function renderAlertHtml(filter: SavedFilter, events: BoothEvent[]): string {
  const rows = events
    .map(
      (e) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb">
          <div style="font-weight:600;font-size:16px;color:#111">
            <a href="${escapeHtml(e.exhibitPageUrl)}" style="color:#111;text-decoration:none">
              ${escapeHtml(e.name)}
            </a>
          </div>
          <div style="color:#555;font-size:14px;margin-top:4px">
            ${escapeHtml(e.city)}, ${escapeHtml(e.country)} - ${escapeHtml(e.venue)}
          </div>
          <div style="font-size:14px;margin-top:6px">
            <strong>Status:</strong> ${escapeHtml(BOOTH_STATUS_LABELS[e.boothStatus])}<br/>
            <strong>Cost:</strong> ${escapeHtml(COST_BAND_LABELS[e.costBand])}<br/>
            <strong>Dates:</strong> ${fmtDate(e.startDate)} - ${fmtDate(e.endDate)}<br/>
            ${
              e.applicationDeadline
                ? `<strong>Application deadline:</strong> ${fmtDate(
                    e.applicationDeadline,
                  )}<br/>`
                : ""
            }
          </div>
        </td>
      </tr>`,
    )
    .join("");

  return `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px;margin:0 0 8px">BoothScout alert</h1>
      <p style="color:#555;margin:0 0 16px">
        ${filter.name ? `Filter: <strong>${escapeHtml(filter.name)}</strong><br/>` : ""}
        ${events.length} new match${events.length === 1 ? "" : "es"} for your saved filter.
      </p>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <p style="color:#888;font-size:12px;margin-top:24px">
        You're receiving this because you saved a filter on BoothScout.
      </p>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
