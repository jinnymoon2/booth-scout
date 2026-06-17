import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "./components-nav";

export const metadata: Metadata = {
  title: "BoothScout",
  description: "Find tech events where you can still get a booth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
