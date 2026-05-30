/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Rate limits are enforced per Vercel function instance. Since serverless
 * functions can run across multiple instances simultaneously, this is not
 * a global hard cap — but it provides strong protection against rapid abuse
 * from a single client hitting the same instance repeatedly.
 *
 * For a stricter global limit at scale, swap the store for Upstash Redis:
 * https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

interface RateWindow {
  count:   number;
  resetAt: number; // Unix ms
}

const store = new Map<string, RateWindow>();

// Prune stale entries every 5 minutes to prevent unbounded memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (win.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Unique key — use userId for authenticated routes, IP for public ones */
  key:      string;
  /** Maximum number of requests allowed within the window */
  limit:    number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number; // Unix ms
}

/**
 * Check whether a request is within the rate limit.
 * Call this immediately after verifying auth.
 */
export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const win = store.get(key);

  if (!win || win.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (win.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: win.resetAt };
  }

  win.count += 1;
  return { allowed: true, remaining: limit - win.count, resetAt: win.resetAt };
}

/**
 * Returns a ready-made 429 Response if the request is rate-limited,
 * or null if it should proceed.
 *
 * Usage:
 *   const limited = rateLimitResponse(checkRateLimit({ key: userId, limit: 20, windowMs: 60_000 }));
 *   if (limited) return limited;
 */
export function rateLimitResponse(result: RateLimitResult): Response | null {
  if (result.allowed) return null;

  const retryAfterSecs = Math.ceil((result.resetAt - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests — please wait a moment before trying again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type":    "application/json",
        "Retry-After":     String(retryAfterSecs),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    }
  );
}

// ── Preset helpers ─────────────────────────────────────────────────────────────

/** 20 requests per minute — for AI chat */
export const CHAT_LIMIT    = { limit: 20, windowMs: 60 * 1000 } as const;

/** 10 requests per hour — for CV analysis / revamp */
export const CV_LIMIT      = { limit: 10, windowMs: 60 * 60 * 1000 } as const;

/** 10 requests per hour — for skills gap, career paths, roadmaps */
export const ANALYSIS_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 } as const;
