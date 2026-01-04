/**
 * Enterprise-level caching utility for Supabase Edge Functions
 * Uses Deno Cache API for in-memory caching with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class EdgeCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL (time to live in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Generate cache key from params
   */
  static generateKey(prefix: string, ...params: (string | number | null | undefined)[]): string {
    const parts = params
      .filter(p => p !== null && p !== undefined)
      .map(p => String(p));
    return `${prefix}:${parts.join(':')}`;
  }
}

// Singleton instance
let cacheInstance: EdgeCache | null = null;

export function getCache(): EdgeCache {
  if (!cacheInstance) {
    cacheInstance = new EdgeCache(1000);
  }
  return cacheInstance;
}

/**
 * Cached function wrapper
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cache = getCache();
  const cached = await cache.get<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  await cache.set(key, result, ttlSeconds);
  return result;
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  tenant: (slug: string) => EdgeCache.generateKey('tenant', slug),
  tenantById: (id: string) => EdgeCache.generateKey('tenant', 'id', id),
  domain: (domain: string) => EdgeCache.generateKey('domain', domain),
  domainTenant: (domain: string) => EdgeCache.generateKey('domain:tenant', domain),
  integration: (tenantId: string) => EdgeCache.generateKey('integration', tenantId),
  storeSettings: (tenantId: string) => EdgeCache.generateKey('settings', tenantId),
  product: (tenantId: string, productId: string) => EdgeCache.generateKey('product', tenantId, productId),
  generateKey: EdgeCache.generateKey,
};

