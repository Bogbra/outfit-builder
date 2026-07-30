import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

import { env } from "./env.js";

export interface RateLimiterOverrides {
  windowMs: number;
  limit: number;
}

// One instance per call so each route family gets its own independent
// budget (docs/07-security.md "Rate Limiting"). Overrides are for routes
// that need a stricter budget than the shared default — e.g. try-on.ts,
// where each request costs real money against a third-party API.
export function createRateLimiter(overrides?: RateLimiterOverrides): RateLimitRequestHandler {
  return rateLimit({
    windowMs: overrides?.windowMs ?? env.RATE_LIMIT_WINDOW_SECONDS * 1000,
    limit: overrides?.limit ?? env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
