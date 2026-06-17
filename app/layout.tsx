import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoothScout",
  description: "Browse global technology events and event sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
