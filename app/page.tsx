import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            BoothScout
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Browse IT events and booth opportunities.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Search technology, AI, startup, developer, cybersecurity, cloud,
            semiconductor, and software-related events across Korea, Japan,
            the United States, and global event directories.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Browse IT events
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Discover more sources
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              BoothScout checks venue calendars, official event pages, startup
              directories, and developer conference directories.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Filter by region
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Search Korea, Japan, the United States, or global sources without
              duplicate Korea and South Korea filters.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Focus on IT relevance
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Results prioritize AI, software, cloud, cybersecurity, startup,
              developer, data, semiconductor, and digital transformation events.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
