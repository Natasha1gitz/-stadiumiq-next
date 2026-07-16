'use client';

import { useState, useRef, useEffect } from 'react';
import { askGemini } from '@/app/actions/gemini';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/domain/schemas';

interface Message {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly text: string;
  readonly language: SupportedLanguage;
}

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ar: 'العربية (Arabic)',
};

const QUICK_ACTIONS = [
  'Where is the nearest medical tent?',
  'Route to wheelchair seating section C.',
  'Current wait time for gate A?',
];

/**
 * Multilingual Steward Chat Interface.
 * Implements WCAG 2.2 AA standards including RTL text support, 44px targets,
 * and aria-live regions for screen readers.
 *
 * @returns The Steward Chat client component.
 */
export function StewardChat() {
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (text.trim().length === 0) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const result = await askGemini({ question: text, language });

    if (result.ok) {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: result.value.answer,
        language: result.value.language,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <section className="flex flex-col h-[70vh] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      
      {/* Header & Controls */}
      <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-wrap gap-4 justify-between items-center">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Steward Assistant</h2>
        
        <div className="flex items-center gap-2">
          <label htmlFor="lang-select" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Language:
          </label>
          {/* Native select for perfect keyboard accessibility */}
          <select
            id="lang-select"
            value={language}
            onChange={(e) => { setLanguage(e.target.value as SupportedLanguage); }}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{LANGUAGE_NAMES[lang]}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Message List */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-50/50 dark:bg-black"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-zinc-500 dark:text-zinc-400">Ask a question or select a quick action.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => { setInput(action); }}
                  className="min-h-[44px] px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors motion-reduce:transition-none"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <article
              key={msg.id}
              dir="auto"
              lang={msg.language}
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'ml-auto bg-blue-600 text-white rounded-tr-none'
                  : 'mr-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </article>
          ))
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mr-auto max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            <p role="status" aria-busy="true">Translating & Generating...</p>
          </div>
        )}

        {/* Error State */}
        {error !== null && (
          <div className="mx-auto text-center p-3">
            <p role="alert" className="text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg inline-block">
              Connection Error: {error}
            </p>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 min-h-[44px] px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            aria-label="Question input"
          />
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            className="min-h-[44px] min-w-[88px] px-6 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg disabled:opacity-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors motion-reduce:transition-none"
          >
            Send
          </button>
        </form>
      </footer>
    </section>
  );
}
