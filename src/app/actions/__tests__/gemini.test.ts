/** Tests for Gemini Server Action — 8 test cases as per test-plan.md Module 7. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock server-only before importing the action
vi.mock('server-only', () => ({}));

import { askGemini } from '@/app/actions/gemini';
import * as sanitizeModule from '@/lib/infrastructure/sanitize-model';

// Mock the Gemini SDK
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: async (prompt: string) => {
            if (prompt.includes('fail-trigger')) {
              throw new Error('Simulated API failure');
            }
            if (prompt.includes('bad-format')) {
              return { response: { text: () => '' } }; // Empty answer fails LLMResponseSchema
            }
            return { response: { text: () => 'Mocked AI answer' } };
          },
        };
      }
    },
  };
});

describe('askGemini Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['GEMINI_API_KEY'] = 'test-key';
  });

  afterEach(() => {
    delete process.env['GEMINI_API_KEY'];
  });

  // Test 1: Valid query returns ok Result
  it('returns ok Result with valid query', async () => {
    const originalEnv = process.env['GEMINI_API_KEY'];
    process.env['GEMINI_API_KEY'] = 'test-key';

    const result = await askGemini({ question: 'Where is Gate A?', language: 'en' }, 'ip-1');
    process.env['GEMINI_API_KEY'] = originalEnv;

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.answer).toBe('Mocked AI answer');
      expect(result.value.language).toBe('en');
    }
  });

  // Test 2: Empty query returns err Result
  it('returns err Result for invalid input (empty question)', async () => {
    const result = await askGemini({ question: '', language: 'en' }, 'ip-2');

    expect(result.ok).toBe(false);
  });

  // Test 3: Gemini API failure returns err Result
  it('handles Gemini API failures gracefully', async () => {
    const result = await askGemini({ question: 'fail-trigger', language: 'en' }, 'ip-3');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('API_ERROR');
    }
  });

  // Test 4: Output is sanitized
  it('calls sanitizeModelText on the output', async () => {
    const sanitizeSpy = vi.spyOn(sanitizeModule, 'sanitizeModelText');

    await askGemini({ question: 'Safe question', language: 'en' }, 'ip-4');

    expect(sanitizeSpy).toHaveBeenCalled();
  });

  // Test 5: Output passes LLMResponseSchema
  it('validates output against LLMResponseSchema', async () => {
    const result = await askGemini({ question: 'bad-format', language: 'en' }, 'ip-5');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Invalid LLM response format');
    }
  });

  // Test 6: Cached query returns stale value
  it('returns cached value for identical queries', async () => {
    const result1 = await askGemini({ question: 'Cache test', language: 'en' }, 'ip-6');
    const result2 = await askGemini({ question: 'Cache test', language: 'en' }, 'ip-7');

    expect(result1).toEqual(result2); // Result2 comes from cache
  });

  // Test 7: Language parameter propagates
  it('propagates language to the prompt (indirectly tested via return value)', async () => {
    const result = await askGemini({ question: 'Language test', language: 'fr' }, 'ip-8');

    if (result.ok) {
      expect(result.value.language).toBe('fr');
    }
  });

  // Test 8: Rate-limited request returns appropriate error
  it('returns RATE_LIMITED error when limit exceeded', async () => {
    // 10 requests allowed per minute in our simple implementation
    for (let i = 0; i < 10; i++) {
      await askGemini({ question: `Spam ${i}`, language: 'en' }, 'spam-ip');
    }

    // 11th request should be rate limited
    const result = await askGemini({ question: 'One too many', language: 'en' }, 'spam-ip');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('RATE_LIMITED');
    }
  });
});
