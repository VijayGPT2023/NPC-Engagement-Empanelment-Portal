interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  // TODO: When REDIS_URL is set, use Redis instead
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

export async function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL): Promise<void> {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export async function invalidateCache(pattern: string): Promise<void> {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(pattern)) {
      memoryCache.delete(key);
    }
  }
}

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now > entry.expiresAt) {
      memoryCache.delete(key);
    }
  }
}, 10 * 60 * 1000);
