import Link from "next/link";

/**
 * StadiumIQ Landing Page.
 * Provides an overview of the platform capabilities and navigation to key routes.
 * Implements WCAG 2.2 AA with proper heading hierarchy and semantic structure.
 *
 * @returns The Home page component.
 */
export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-zinc-50 dark:bg-black font-sans">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          StadiumIQ
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Real-time matchday intelligence for the FIFA 2026 World Cup.
          Crowd management, multilingual steward dispatch, accessible transit
          routing, and sustainability tracking — all in one command platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/transit"
            className="min-h-[44px] inline-flex items-center justify-center px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors motion-reduce:transition-none focus:ring-4 focus:ring-zinc-400"
          >
            Transit Dashboard
          </Link>
          <Link
            href="/steward"
            className="min-h-[44px] inline-flex items-center justify-center px-8 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors motion-reduce:transition-none focus:ring-4 focus:ring-zinc-400"
          >
            Steward Dispatch
          </Link>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
          <article className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Crowd Management</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Live crowd density heatmaps with automatic status classification.
            </p>
          </article>
          <article className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Multilingual AI</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Steward assistance in 5 languages with RTL support powered by Gemini.
            </p>
          </article>
          <article className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Sustainability</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              EV shuttles, carbon offsets, and water refill station tracking.
            </p>
          </article>
          <article className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Accessibility</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              WCAG 2.2 AA compliant. WAV routing and screen reader support.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
