/** Tests for the transit hub simulator — 10 test cases as per test-plan.md Module 3. */
import { describe, it, expect, vi } from 'vitest';
import { generateTransitData, generateAllHubs } from '@/lib/domain/simulator';
import { TransitDataSchema } from '@/lib/domain/schemas';

describe('generateTransitData', () => {
  // Test 1: Returns ok Result with valid inputs
  it('returns ok with valid hubId and seed', () => {
    const result = generateTransitData('hub-north', 42);

    expect(result.ok).toBe(true);
  });

  // Test 2: Same seed produces same output (determinism) and exact expected values
  it('produces deterministic output for same seed and matches expected math', () => {
    const a = generateTransitData('hub-north', 42);
    const b = generateTransitData('hub-north', 42);

    expect(a).toEqual(b);
    
    // Exact value checks to kill arithmetic Stryker mutants
    if (a.ok) {
      expect(a.value).toEqual({
        hubId: 'hub-north',
        hubName: 'NRG South Terminal',
        capacity: 607,
        crowdLevel: 10,
        wavAvailable: 3,
        evShuttleCount: 6,
        carbonOffsetPct: 21,
        waterRefillStations: 1,
        status: 'comfortable',
      });
    }
  });

  // Test 3: Different seeds produce different output
  it('produces different output for different seeds', () => {
    const a = generateTransitData('hub-north', 42);
    const b = generateTransitData('hub-north', 99);

    if (a.ok && b.ok) {
      expect(a.value.crowdLevel).not.toEqual(b.value.crowdLevel);
    }
  });

  // Test 4: Returns err for empty hubId
  it('returns err for empty hubId', () => {
    const result = generateTransitData('', 42);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Hub ID cannot be empty');
    }
  });

  // Test 5: Returns err for negative seed
  it('returns err for negative seed', () => {
    const result = generateTransitData('hub-north', -1);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Seed must be non-negative');
    }
  });

  // Test 6: Crowd level is between 0 and capacity
  it('generates crowd level within capacity bounds', () => {
    const result = generateTransitData('hub-north', 42);

    if (result.ok) {
      expect(result.value.crowdLevel).toBeGreaterThanOrEqual(0);
      expect(result.value.crowdLevel).toBeLessThanOrEqual(result.value.capacity);
    }
  });

  // Test 7: EV shuttle count is non-negative
  it('generates non-negative EV shuttle count', () => {
    const result = generateTransitData('hub-test', 100);

    if (result.ok) {
      expect(result.value.evShuttleCount).toBeGreaterThanOrEqual(0);
    }
  });

  // Test 8: Carbon offset is within 0–100
  it('generates carbon offset between 0 and 100', () => {
    const result = generateTransitData('hub-green', 55);

    if (result.ok) {
      expect(result.value.carbonOffsetPct).toBeGreaterThanOrEqual(0);
      expect(result.value.carbonOffsetPct).toBeLessThanOrEqual(100);
    }
  });

  // Test 9: WAV availability is non-negative
  it('generates non-negative WAV availability', () => {
    const result = generateTransitData('hub-wav', 77);

    if (result.ok) {
      expect(result.value.wavAvailable).toBeGreaterThanOrEqual(0);
    }
  });

  // Test 10: Output passes TransitDataSchema validation
  it('produces output that passes Zod schema validation', () => {
    const result = generateTransitData('hub-valid', 42);

    if (result.ok) {
      const parsed = TransitDataSchema.safeParse(result.value);

      expect(parsed.success).toBe(true);
    }
  });

  // Test 11: Zod schema failure path
  it('returns err when internal Zod parsing fails', () => {
    const spy = vi.spyOn(TransitDataSchema, 'safeParse').mockReturnValue({ 
      success: false, 
      error: { message: 'Mock Zod error' } as never 
    });
    const result = generateTransitData('hub-fail', 42);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Mock Zod error');
    }
    spy.mockRestore();
  });
});

describe('generateAllHubs', () => {
  it('returns ok with array of TransitData for valid seed', () => {
    const result = generateAllHubs(42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0);
    }
  });

  it('returns err for negative seed', () => {
    const result = generateAllHubs(-1);

    expect(result.ok).toBe(false);
  });

  it('returns err if any hub fails to generate', () => {
    const spy = vi.spyOn(TransitDataSchema, 'safeParse').mockReturnValue({ 
      success: false, 
      error: { message: 'Mock Zod error' } as never 
    });
    const result = generateAllHubs(42);

    expect(result.ok).toBe(false);
    spy.mockRestore();
  });
});
