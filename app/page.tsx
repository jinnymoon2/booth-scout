import Link from "next/link";
import { Bell, CalendarDays, Search } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Exhibitor-first IT event discovery
          </p>

          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Find IT and tech events where you can still get a booth.
          </h1>

          <p className="mt-6 text-lg text-slate-300">
            BoothScout helps founders, marketers, sales teams, and DevRel teams
            discover IT-related events by booth availability, deadline, price
            band, format, audience, category, and region.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Browse events
            </Link>

            <Link
              href="/submit"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-900"
            >
              Submit an event
            </Link>

            <Link
              href="/alerts"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-900"
            >
              Create alert
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Feature
            href="/events"
            icon={<Search />}
            title="Search all IT event types"
            text="Filter cloud, cybersecurity, AI, SaaS, DevOps, networking, enterprise software, and developer events."
          />

          <Feature
            href="/events"
            icon={<CalendarDays />}
            title="Track booth deadlines"
            text="Separate booth application deadlines from event dates so teams do not miss the buying window."
          />

          <Feature
            href="/alerts"
            icon={<Bell />}
            title="Get saved-filter alerts"
            text="Receive updates when matching booth opportunities appear or change status."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-300 hover:bg-slate-800"
    >
      <div className="mb-4 text-cyan-300">{icon}</div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </Link>
  );
}
