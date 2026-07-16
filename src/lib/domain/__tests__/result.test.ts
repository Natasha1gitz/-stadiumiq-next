/** Tests for the Result Monad — 7 test cases as per test-plan.md Module 1. */
import { describe, it, expect } from 'vitest';
import { ok, err, assertUnreachable } from '@/lib/domain/result';

describe('Result Monad', () => {
  // Test 1: ok() wraps value correctly
  it('ok() wraps a value with ok: true', () => {
    const result = ok(42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  // Test 2: err() wraps error correctly
  it('err() wraps an error with ok: false', () => {
    const error = new Error('fail');
    const result = err(error);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(error);
    }
  });

  // Test 3: ok() with undefined value
  it('ok() correctly wraps undefined', () => {
    const result = ok(undefined);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeUndefined();
    }
  });

  // Test 4: ok() with null value
  it('ok() correctly wraps null', () => {
    const result = ok(null);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });

  // Test 5: ok() with complex object
  it('ok() correctly wraps complex objects', () => {
    const data = { name: 'Hub', stats: [1, 2, 3] };
    const result = ok(data);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(data);
    }
  });

  // Test 6: err() with string error
  it('err() wraps a string error', () => {
    const result = err('string-error');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('string-error');
    }
  });

  // Test 7: assertUnreachable throws
  it('assertUnreachable throws with the provided value', () => {
    expect(() => {
      assertUnreachable('unexpected' as never);
    }).toThrow('Unreachable case: unexpected');
  });
});
