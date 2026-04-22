import { env } from "@lib/env";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, MemoryBucket>();

const upstashConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

const upstashLimiter = upstashConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(
        env.RATE_LIMIT_REQUESTS,
        `${env.RATE_LIMIT_WINDOW_SECONDS} s`,
      ),
      analytics: false,
      timeout: 500,
      prefix: "nexusflow:rate-limit",
    })
  : null;

function checkMemoryLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_SECONDS * 1000;
  const current = memoryBuckets.get(identifier);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: env.RATE_LIMIT_REQUESTS,
      remaining: env.RATE_LIMIT_REQUESTS - 1,
      reset: resetAt,
      retryAfter: 0,
    };
  }

  current.count += 1;
  const success = current.count <= env.RATE_LIMIT_REQUESTS;
  return {
    success,
    limit: env.RATE_LIMIT_REQUESTS,
    remaining: Math.max(env.RATE_LIMIT_REQUESTS - current.count, 0),
    reset: current.resetAt,
    retryAfter: success ? 0 : Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
  };
}

export async function checkRateLimit(identifier: string) {
  if (!upstashLimiter) {
    return checkMemoryLimit(identifier);
  }

  try {
    const result = await upstashLimiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? 0 : Math.max(Math.ceil((result.reset - Date.now()) / 1000), 1),
    };
  } catch (error) {
    console.warn(
      "[rate-limit] Upstash unavailable, falling back to in-memory rate limiting",
      error,
    );
    return checkMemoryLimit(identifier);
  }
}

export function resetRateLimitBucketsForTests() {
  memoryBuckets.clear();
}
