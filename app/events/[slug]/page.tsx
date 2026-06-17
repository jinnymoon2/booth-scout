import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { BoothEvent } from "../../lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const event = data as BoothEvent;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/events" className="text-sm text-slate-500 hover:text-slate-900">
          ← Events
        </Link>

        <section className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-950">{event.name}</h1>

              <p className="mt-2 text-slate-600">
                {event.city ? `${event.city}, ` : ""}
                {event.country} · {event.start_date}
                {event.end_date ? ` – ${event.end_date}` : ""}
              </p>
            </div>

            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              {label(event.booth_status)}
            </span>
          </div>

          {event.description && (
            <p className="mt-6 text-slate-700">{event.description}</p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info title="IT category" value={label(event.event_category || "general_it")} />
            <Info title="Audience" value={label(event.audience_type)} />
            <Info title="Format" value={label(event.event_format)} />
            <Info title="Application deadline" value={event.application_deadline || "Unknown"} />
            <Info title="Booth price" value={price(event)} />
            <Info title="Price visibility" value={label(event.price_visibility)} />
            <Info title="Estimated attendees" value={event.estimated_attendees?.toLocaleString() || "Unknown"} />
            <Info title="Verified status" value={label(event.verified_status)} />
            <Info
              title="Last verified"
              value={
                event.last_verified_at
                  ? new Date(event.last_verified_at).toLocaleDateString()
                  : "Unknown"
              }
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {event.sponsor_url && (
              <a
                href={event.sponsor_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Official sponsor / exhibit page
              </a>
            )}

            {event.website_url && (
              <a
                href={event.website_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border px-5 py-3 font-semibold text-slate-950"
              >
                Event website
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 font-medium text-slate-950">{value}</p>
    </div>
  );
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

function price(event: BoothEvent) {
  if (!event.booth_price_min && !event.booth_price_max) {
    return event.price_visibility === "contact_for_pricing"
      ? "Contact for pricing"
      : "Unknown";
  }

  const currency = event.booth_price_currency || "USD";

  if (event.booth_price_min && event.booth_price_max) {
    return `${currency} ${event.booth_price_min.toLocaleString()}–${event.booth_price_max.toLocaleString()}`;
  }

  if (event.booth_price_min) {
    return `${currency} ${event.booth_price_min.toLocaleString()}+`;
  }

  return "Unknown";
}
