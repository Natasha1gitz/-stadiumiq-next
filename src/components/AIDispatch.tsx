'use client';

import { useState } from 'react';
import { askGemini } from '@/app/actions/gemini';
import type { TransitData } from '@/lib/domain/schemas';

/** Props for the AIDispatch component. */
interface AIDispatchProps {
  /** The current live transit context to pass to the AI. */
  readonly context: readonly TransitData[];
}

/**
 * Client component providing a button to request AI dispatch instructions.
 * Demonstrates accessible ARIA live regions and loading states.
 *
 * @param props - The transit data context.
 * @returns The interactive AI Dispatch UI.
 */
export function AIDispatch({ context }: AIDispatchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDispatch = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const criticalHubs = context.filter(h => h.status === 'critical').map(h => h.hubName);
    
    const promptText = `Generate a 2-sentence dispatch order for stewards to mitigate crowd crush at these critical hubs: ${criticalHubs.join(', ')}. Focus on safety.`;

    const result = await askGemini({ question: promptText, language: 'en' });

    if (result.ok) {
      setResponse(result.value.answer);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <section aria-labelledby="dispatch-title" className="w-full mt-8 p-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
      <h2 id="dispatch-title" className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Operational Intelligence
      </h2>
      
      {/* 
        WCAG 2.5.8: Target size at least 44x44 CSS pixels.
        motion-reduce applied for WCAG 2.3.3.
      */}
      <button
        type="button"
        onClick={() => void handleDispatch()}
        disabled={isLoading}
        className="min-h-[44px] min-w-[44px] px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:ring-4 focus:ring-zinc-400 disabled:opacity-50 transition-colors motion-reduce:transition-none"
      >
        {isLoading ? 'Generating Orders...' : 'Generate AI Dispatch Briefing'}
      </button>

      {/* Accessible live region for screen readers */}
      <div 
        className="mt-4 min-h-[60px]"
        aria-live="polite" 
        aria-busy={isLoading}
      >
        {isLoading && (
          <p role="status" className="text-zinc-600 dark:text-zinc-400">
            Consulting Gemini intelligence...
          </p>
        )}
        
        {error !== null && (
          <p role="alert" className="text-red-600 dark:text-red-400 font-medium">
            Error: {error}
          </p>
        )}
        
        {response !== null && (
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-zinc-100 rounded-r-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1">
              Active Orders
            </h3>
            <p>{response}</p>
          </div>
        )}
      </div>
    </section>
  );
}
