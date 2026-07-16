/** Tests for SWRMemoryCache — 10 test cases as per test-plan.md Module 4. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SWRMemoryCache } from '@/lib/infrastructure/swr-cache';

describe('SWRMemoryCache', () => {
  let cache: SWRMemoryCache<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new SWRMemoryCache<string, string>(100, 500);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test 1: get() returns undefined for unknown key
  it('returns undefined for unknown key', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  // Test 2: set() + get() returns the value
  it('returns cached value after set()', () => {
    cache.set('key', 'value');

    expect(cache.get('key')).toBe('value');
  });

  // Test 3: Returns stale value after staleMs and triggers revalidation
  it('returns stale value and triggers revalidation', () => {
    cache.set('key', 'stale-value');

    vi.advanceTimersByTime(150); // Past staleMs (100), within maxAgeMs (500)

    const revalidate = vi.fn().mockResolvedValue('fresh-value');
    const result = cache.get('key', revalidate);

    expect(result).toBe('stale-value');
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  // Test 4: Returns undefined after maxAgeMs
  it('returns undefined for expired entries', () => {
    cache.set('key', 'value');
    vi.advanceTimersByTime(600); // Past maxAgeMs (500)

    expect(cache.get('key')).toBeUndefined();
  });

  // Test 5: Concurrent get() calls don't trigger multiple revalidations
  it('prevents duplicate revalidations for concurrent reads', () => {
    cache.set('key', 'val');
    vi.advanceTimersByTime(150); // Past staleMs

    const revalidate = vi.fn().mockResolvedValue('new');

    cache.get('key', revalidate);
    cache.get('key', revalidate);

    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  // Test 6: set() overwrites existing entry
  it('overwrites existing entries on set()', () => {
    cache.set('key', 'old');
    cache.set('key', 'new');

    expect(cache.get('key')).toBe('new');
  });

  // Test 7: clear() removes all entries
  it('removes all entries on clear()', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });

  // Test 8: delete() removes single entry
  it('removes only the targeted entry on delete()', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.delete('a');

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('2');
  });

  // Test 9: Cache with 0 staleMs always attempts revalidation
  it('always attempts revalidation with 0 staleMs', () => {
    const alwaysStale = new SWRMemoryCache<string, string>(0, 500);

    alwaysStale.set('key', 'val');
    vi.advanceTimersByTime(1);

    const revalidate = vi.fn().mockResolvedValue('new');

    alwaysStale.get('key', revalidate);

    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  // Test 10: Cache with very large maxAgeMs never expires in test window
  it('never expires with very large maxAgeMs', () => {
    const longLived = new SWRMemoryCache<string, string>(100, 999_999_999);

    longLived.set('key', 'val');
    vi.advanceTimersByTime(10_000);

    expect(longLived.get('key')).toBe('val');
  });
});
