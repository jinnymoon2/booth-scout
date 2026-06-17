import Link from "next/link";

export function SiteNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-slate-950">
          BoothScout
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/events" className="hover:text-slate-950">
            Browse events
          </Link>
        </div>
      </nav>
    </header>
  );
}
