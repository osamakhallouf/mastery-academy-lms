type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const getStore = () => {
  if (!globalThis.__rateLimitStore) {
    globalThis.__rateLimitStore = new Map<string, RateLimitEntry>();
  }
  return globalThis.__rateLimitStore;
};

export const rateLimit = (
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult => {
  const now = Date.now();
  const store = getStore();
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
};

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
