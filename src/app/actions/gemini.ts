"use server";
import 'server-only';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Result, ok, err } from '@/lib/domain/result';
import {
  type StewardQuery,
  type LLMResponse,
  StewardQuerySchema,
  LLMResponseSchema,
} from '@/lib/domain/schemas';
import { SWRMemoryCache } from '@/lib/infrastructure/swr-cache';
import { sanitizeModelText } from '@/lib/infrastructure/sanitize-model';
import { log } from '@/lib/infrastructure/logger';

/** Cache for Gemini responses: 5 minutes stale, 1 hour max age. */
const llmCache = new SWRMemoryCache<string, LLMResponse>(300_000, 3_600_000);

/** Request counter for simple rate limiting (simulating Edge constraints). */
const rateLimitMap = new Map<string, number[]>();

/** Checks a simple per-minute rate limit for the server action. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => t > windowStart);

  recent.push(now);
  rateLimitMap.set(ip, recent);

  return recent.length > 10;
}

/**
 * Invokes the Gemini API to answer a steward's query.
 *
 * @param query - The validated steward query.
 * @returns The structured LLM response.
 */
async function fetchFromGemini(query: StewardQuery): Promise<LLMResponse> {
  const apiKey = process.env['GEMINI_API_KEY'] ?? 'mock-key';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a matchday steward assistant for the FIFA 2026 World Cup.
Answer the following query concisely in this language code: ${query.language}.
Query: ${query.question}`;

  // In test environments, we may not have a real API key.
  if (apiKey === 'mock-key' && process.env['NODE_ENV'] === 'test') {
    return { answer: `Mock answer for: ${query.question}`, language: query.language };
  }

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  return {
    answer: sanitizeModelText(text),
    language: query.language,
  };
}

/**
 * Server Action to submit a query to the Gemini Assistant.
 * Validates input, checks cache, calls LLM, sanitizes, and returns a Result.
 *
 * @param rawInput - The unvalidated input object.
 * @param ip - Client IP for rate limiting (passed from middleware/headers in real usage).
 * @returns A Result containing the LLMResponse, or an Error.
 *
 * @example
 * ```ts
 * const result = await askGemini({ question: 'Where is Gate A?', language: 'en' });
 * if (result.ok) console.log(result.value.answer);
 * ```
 */
export async function askGemini(
  rawInput: unknown,
  ip = '127.0.0.1',
): Promise<Result<LLMResponse, string>> {
  if (isRateLimited(ip)) {
    log('warn', 'Rate limit exceeded in askGemini', { ip });

    return err('RATE_LIMITED');
  }

  const parsed = StewardQuerySchema.safeParse(rawInput);

  if (!parsed.success) {
    return err(parsed.error.message);
  }

  const query = parsed.data;
  const cacheKey = `${query.language}:${query.question}`;

  try {
    const cached = llmCache.get(cacheKey, async () => fetchFromGemini(query));

    if (cached !== undefined) {
      return ok(cached);
    }

    const fresh = await fetchFromGemini(query);
    const validated = LLMResponseSchema.safeParse(fresh);

    if (!validated.success) {
      return err('Invalid LLM response format');
    }

    llmCache.set(cacheKey, validated.data);

    return ok(validated.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'Gemini API failure', { error: message });

    return err('API_ERROR');
  }
}
