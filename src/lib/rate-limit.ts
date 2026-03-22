// Simple in-memory rate limiter for Next.js API routes
// In production with multiple instances, this should use Redis

interface RateLimitConfig {
  windowMs: number; // time window in milliseconds
  maxRequests: number; // max requests per window per IP
}

// Predefined limits for sensitive endpoints
export const RATE_LIMITS = {
  login: { windowMs: 60_000, maxRequests: 10 }, // 10/min
  register: { windowMs: 60_000, maxRequests: 5 }, // 5/min
  submit: { windowMs: 60_000, maxRequests: 5 }, // 5/min
  upload: { windowMs: 60_000, maxRequests: 20 }, // 20/min
  forgotPassword: { windowMs: 60_000, maxRequests: 3 }, // 3/min
  general: { windowMs: 60_000, maxRequests: 60 }, // 60/min
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Automatically clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  // If no existing entry or window has expired, start a new window
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(resetAt),
    };
  }

  // Window is still active — increment count
  existing.count += 1;

  if (existing.count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt),
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetAt: new Date(existing.resetAt),
  };
}
