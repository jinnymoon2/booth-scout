import Link from "next/link";

export default function AlertsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Feature removed
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Saved-filter alerts are no longer available.
        </h1>

        <p className="mt-4 text-slate-600">
          BoothScout now focuses on browsing and discovering IT-related events.
        </p>

        <Link
          href="/events"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Browse IT events
        </Link>
      </div>
    </main>
  );
}
