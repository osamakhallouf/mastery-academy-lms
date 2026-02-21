import { Redis } from "@upstash/redis";

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const REDIS_KEY_PREFIX = "rl:";

const FIXED_WINDOW_SCRIPT = `
  local k = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window_ms = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local v = redis.call("GET", k)
  local count, reset_at
  if v then
    local sep = string.find(v, ":")
    count = tonumber(string.sub(v, 1, sep - 1))
    reset_at = tonumber(string.sub(v, sep + 1, -1))
    if now >= reset_at then
      count = 1
      reset_at = now + window_ms
    elseif count >= limit then
      return {0, reset_at, 0}
    else
      count = count + 1
    end
  else
    count = 1
    reset_at = now + window_ms
  end
  local ttl_ms = reset_at - now
  if ttl_ms > 0 then
    redis.call("SET", k, count .. ":" .. reset_at, "PX", ttl_ms)
  end
  return {1, reset_at, limit - count}
`;

type RateLimitEntry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

function getMemoryStore(): Map<string, RateLimitEntry> {
  if (!globalThis.__rateLimitStore) {
    globalThis.__rateLimitStore = new Map<string, RateLimitEntry>();
  }
  return globalThis.__rateLimitStore;
}

function rateLimitMemory(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const store = getMemoryStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetAt,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: existing.resetAt,
    };
  }

  const updated = { ...existing, count: existing.count + 1 };
  store.set(key, updated);

  return {
    success: true,
    limit,
    remaining: limit - updated.count,
    reset: updated.resetAt,
  };
}

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";

  if (!url || !token) {
    if (isProduction) {
      throw new Error(
        "Missing required environment variable: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production."
      );
    }
    return null;
  }
  return new Redis({ url, token });
}

export async function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const redisKey = REDIS_KEY_PREFIX + key;
      const now = Date.now();
      const result = await redis.eval(
        FIXED_WINDOW_SCRIPT,
        [redisKey],
        [limit, windowMs, now]
      );

      if (!Array.isArray(result) || result.length < 3) {
        throw new Error("Unexpected rate limit script result");
      }

      const [success, reset, remaining] = result as [unknown, unknown, unknown];
      return {
        success: Number(success) === 1,
        limit,
        remaining: Math.max(0, Number(remaining)),
        reset: Number(reset),
      };
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
      console.error("[RATE_LIMIT] Redis error, falling back to memory:", error);
      return rateLimitMemory(key, { limit, windowMs });
    }
  }

  return rateLimitMemory(key, { limit, windowMs });
}

export const getClientIpFromHeaders = (
  headers: Headers,
  fallback = "unknown"
) => {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || fallback;
  }
  return headers.get("x-real-ip") || fallback;
};
