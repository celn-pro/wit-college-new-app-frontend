const cache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const fetchCache = {
  /**
   * Get cached data by key
   * @param key Cache key
   * @returns Cached data or null if expired/missing
   */
  get(key: string): any | null {
    const cached = cache.get(key);
    if (cached && Date.now() < cached.timestamp + CACHE_TTL) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  },

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to store
   */
  set(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  },

  /**
   * Clear cache for a specific key or all entries
   * @param key Optional key to clear; if omitted, clears entire cache
   */
  clear(key?: string): void {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },
};