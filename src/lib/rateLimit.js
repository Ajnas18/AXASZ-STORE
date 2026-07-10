// Lightweight in-memory rate limiter for development/server environments
const tracker = new Map();

// Periodically clean up expired keys to prevent memory growth
if (typeof global !== 'undefined' && !global._rateLimitInterval) {
  global._rateLimitInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tracker.entries()) {
      if (now > value.resetTime) {
        tracker.delete(key);
      }
    }
  }, 10 * 60 * 1000); // run every 10 minutes
}

/**
 * Validates request count for a unique key within a sliding time window.
 * 
 * @param {string} key Unique identifier (e.g. IP + endpoint)
 * @param {number} limit Maximum permitted requests
 * @param {number} durationMs Time window in milliseconds
 * @returns {Promise<{success: boolean, limit: number, remaining: number, resetSeconds: number}>}
 */
export async function rateLimit(key, limit = 10, durationMs = 60000) {
  const now = Date.now();
  const entry = tracker.get(key) || { count: 0, resetTime: now + durationMs };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + durationMs;
  } else {
    entry.count += 1;
  }

  tracker.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

  return {
    success: entry.count <= limit,
    limit,
    remaining,
    resetSeconds,
  };
}

/**
 * Resolves the client IP address from Next.js request headers.
 * 
 * @param {Request} request Next.js request
 * @returns {string} client IP address
 */
export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
