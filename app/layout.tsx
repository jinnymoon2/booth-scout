import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "./components-nav";
import { isSupabaseConfigured } from "./lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BoothScout - Find tech events you can still exhibit at",
    template: "%s - BoothScout",
  },
  description:
    "An exhibitor-first directory of tech and developer events. Filter by booth availability, deadline, cost, format, and audience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = isSupabaseConfigured();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteNav supabaseConfigured={supabase} />
        <main className="flex-1 w-full">{children}</main>
        <footer className="border-t border-[var(--border)] py-8 mt-16">
          <div className="mx-auto max-w-6xl px-6 text-sm text-[var(--muted)] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>
              BoothScout - an exhibitor-first directory of tech and developer events.
            </div>
            <div className="text-xs">
              Data is best-effort. Always confirm on the official event page.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
