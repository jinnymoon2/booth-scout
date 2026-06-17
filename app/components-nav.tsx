import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-bold text-slate-950">
          BoothScout
        </Link>

        <div className="flex gap-4 text-sm text-slate-700">
          <Link href="/events" className="hover:text-slate-950">
            Events
          </Link>
          <Link href="/alerts" className="hover:text-slate-950">
            Alerts
          </Link>
          <Link href="/submit" className="hover:text-slate-950">
            Submit
          </Link>
        </div>
      </div>
    </nav>
  );
}
