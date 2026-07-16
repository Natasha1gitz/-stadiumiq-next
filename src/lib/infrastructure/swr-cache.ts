/**
 * Stale-While-Revalidate in-memory cache.
 * Returns stale data instantly while revalidating in the background.
 * @module swr-cache
 */

/** Internal cache entry with timestamps for staleness and expiry tracking. */
interface CacheEntry<V> {
  readonly value: V;
  readonly createdAt: number;
  readonly isRevalidating: boolean;
}

/**
 * Generic SWR memory cache with configurable stale and max-age windows.
 *
 * @example
 * ```ts
 * const cache = new SWRMemoryCache<string, string>(30_000, 120_000);
 * cache.set('key', 'value');
 * const result = cache.get('key', async () => fetchFreshValue());
 * ```
 */
export class SWRMemoryCache<K, V> {
  private readonly store = new Map<K, CacheEntry<V>>();
  private readonly staleMs: number;
  private readonly maxAgeMs: number;

  /**
   * Creates an SWR cache instance.
   *
   * @param staleMs - Time in ms before an entry becomes stale (triggers revalidation).
   * @param maxAgeMs - Time in ms before an entry is fully expired and removed.
   */
  constructor(staleMs: number, maxAgeMs: number) {
    this.staleMs = staleMs;
    this.maxAgeMs = maxAgeMs;
  }

  /**
   * Retrieves a cached value, triggering background revalidation if stale.
   *
   * @param key - The cache key.
   * @param revalidate - Async function to fetch a fresh value.
   * @returns The cached value, or `undefined` if expired/missing.
   */
  get(key: K, revalidate?: () => Promise<V>): V | undefined {
    const entry = this.store.get(key);

    if (entry === undefined) {
      return undefined;
    }

    const age = Date.now() - entry.createdAt;

    if (age > this.maxAgeMs) {
      this.store.delete(key);

      return undefined;
    }

    if (age > this.staleMs && !entry.isRevalidating && revalidate !== undefined) {
      this.markRevalidating(key, entry);
      void revalidate().then((freshValue) => {
        this.set(key, freshValue);
      });
    }

    return entry.value;
  }

  /**
   * Stores a value in the cache.
   *
   * @param key - The cache key.
   * @param value - The value to cache.
   */
  set(key: K, value: V): void {
    this.store.set(key, {
      value,
      createdAt: Date.now(),
      isRevalidating: false,
    });
  }

  /**
   * Removes a single entry from the cache.
   *
   * @param key - The cache key to remove.
   */
  delete(key: K): void {
    this.store.delete(key);
  }

  /** Clears all entries from the cache. */
  clear(): void {
    this.store.clear();
  }

  /**
   * Marks an entry as currently revalidating to prevent duplicate fetches.
   *
   * @param key - The cache key.
   * @param entry - The current cache entry.
   */
  private markRevalidating(key: K, entry: CacheEntry<V>): void {
    this.store.set(key, { ...entry, isRevalidating: true });
  }
}
