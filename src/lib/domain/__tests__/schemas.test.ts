/** Tests for Zod schemas — 14 test cases as per test-plan.md Module 2. */
import { describe, it, expect } from 'vitest';
import {
  TransitDataSchema,
  StewardQuerySchema,
  LLMResponseSchema,
  SUPPORTED_LANGUAGES,
} from '@/lib/domain/schemas';

describe('TransitDataSchema', () => {
  const validTransitData = {
    hubId: 'hub-north',
    hubName: 'MetLife North Hub',
    crowdLevel: 250,
    capacity: 500,
    wavAvailable: 3,
    evShuttleCount: 8,
    carbonOffsetPct: 65,
    waterRefillStations: 4,
    status: 'busy' as const,
  };

  // Test 1: Valid data parses successfully
  it('parses valid TransitData', () => {
    const result = TransitDataSchema.safeParse(validTransitData);

    expect(result.success).toBe(true);
  });

  // Test 2: Missing field fails
  it('rejects data with missing hubId', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hubId: _unused, ...incomplete } = validTransitData;
    const result = TransitDataSchema.safeParse(incomplete);

    expect(result.success).toBe(false);
  });

  // Test 3: Wrong types fail
  it('rejects data with wrong types', () => {
    const result = TransitDataSchema.safeParse({
      ...validTransitData,
      crowdLevel: 'not-a-number',
    });

    expect(result.success).toBe(false);
  });

  // Test 4: Negative crowd level fails
  it('rejects negative crowd level', () => {
    const result = TransitDataSchema.safeParse({
      ...validTransitData,
      crowdLevel: -1,
    });

    expect(result.success).toBe(false);
  });

  // Test 5: Crowd level = 0 passes
  it('accepts crowd level of 0', () => {
    const result = TransitDataSchema.safeParse({
      ...validTransitData,
      crowdLevel: 0,
    });

    expect(result.success).toBe(true);
  });

  // Test 6: Large crowd level passes
  it('accepts large crowd level', () => {
    const result = TransitDataSchema.safeParse({
      ...validTransitData,
      crowdLevel: Number.MAX_SAFE_INTEGER,
    });

    expect(result.success).toBe(true);
  });
});

describe('StewardQuerySchema', () => {
  // Test 7: Valid query passes
  it('parses valid steward query', () => {
    const result = StewardQuerySchema.safeParse({
      question: 'Where is gate A12?',
      language: 'en',
    });

    expect(result.success).toBe(true);
  });

  // Test 8: Empty question fails
  it('rejects empty question', () => {
    const result = StewardQuerySchema.safeParse({
      question: '',
      language: 'en',
    });

    expect(result.success).toBe(false);
  });

  // Test 9: Question > 500 chars fails
  it('rejects question exceeding 500 characters', () => {
    const result = StewardQuerySchema.safeParse({
      question: 'x'.repeat(501),
      language: 'en',
    });

    expect(result.success).toBe(false);
  });

  // Test 10: Unsupported language fails
  it('rejects unsupported language code', () => {
    const result = StewardQuerySchema.safeParse({
      question: 'Hello?',
      language: 'xx',
    });

    expect(result.success).toBe(false);
  });

  // Test 11: Each valid language passes
  it.each(SUPPORTED_LANGUAGES)(
    'accepts language code "%s"',
    (lang) => {
      const result = StewardQuerySchema.safeParse({
        question: 'Test question',
        language: lang,
      });

      expect(result.success).toBe(true);
    },
  );
});

describe('LLMResponseSchema', () => {
  // Test 12: Valid response passes
  it('parses valid LLM response', () => {
    const result = LLMResponseSchema.safeParse({
      answer: 'Gate A12 is on the north side.',
      language: 'en',
    });

    expect(result.success).toBe(true);
  });

  // Test 13: HTML in answer still parses (sanitization is separate)
  it('accepts answer containing HTML (sanitization is separate)', () => {
    const result = LLMResponseSchema.safeParse({
      answer: '<b>Bold</b> answer',
      language: 'en',
    });

    expect(result.success).toBe(true);
  });

  // Test 14: Empty answer fails
  it('rejects empty answer', () => {
    const result = LLMResponseSchema.safeParse({
      answer: '',
      language: 'en',
    });

    expect(result.success).toBe(false);
  });
});
