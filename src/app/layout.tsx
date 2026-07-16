import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StadiumIQ — FIFA 2026 Command & Control",
  description:
    "Real-time matchday intelligence platform for the FIFA 2026 World Cup. Crowd management, multilingual steward dispatch, accessible transit routing, and sustainability tracking.",
};

/**
 * Root layout providing global navigation, skip link, and font configuration.
 * Implements WCAG 2.2 AA skip navigation and semantic landmark structure.
 *
 * @param props - The layout props containing child page content.
 * @returns The root HTML shell with shared layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* WCAG 2.4.1: Skip link — first focusable element */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg focus:text-sm"
        >
          Skip to main content
        </a>

        {/* Global navigation */}
        <nav
          aria-label="Primary navigation"
          className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-6 h-14">
            <Link
              href="/"
              className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight"
            >
              StadiumIQ
            </Link>
            <Link
              href="/transit"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Transit
            </Link>
            <Link
              href="/steward"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Steward
            </Link>
          </div>
        </nav>

        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
