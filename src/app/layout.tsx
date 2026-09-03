import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Vote for Luna Love",
  description:
    "A simple bilingual guide to cast a free daily vote for Luna Love.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
      <Analytics />
    </html>
  );
}
