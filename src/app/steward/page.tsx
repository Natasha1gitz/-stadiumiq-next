import { StewardChat } from '@/components/StewardChat';

/**
 * Multilingual Steward Interface.
 * Demonstrates the Navigation, Multilingual, and Crowd Management requirements.
 * Page itself is a Server Component, only the chat is a Client Component.
 *
 * @returns The Next.js page component.
 */
export default function StewardPage() {
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto w-full font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Steward Dispatch
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Multilingual real-time assistance and routing for Matchday Stewards.
        </p>
      </header>

      <StewardChat />
    </main>
  );
}
