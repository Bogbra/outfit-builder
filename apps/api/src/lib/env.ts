import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH is required"),
  // 32 chars (256 bits) is a conventional minimum for a secret signing
  // admin session JWTs — comfortably below what `openssl rand -base64 32`
  // (the .env.example recipe) actually produces (44 chars), but enough to
  // reject trivially weak/short secrets.
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  // Optional, unlike AUTH_SECRET/DATABASE_URL — this only gates the virtual
  // try-on feature, so a missing key shouldn't crash the whole API on boot.
  // The route itself checks for it and returns 503 if unset, rather than
  // every other endpoint failing too. Preprocessed so `FASHN_API_KEY=`
  // (present but empty, e.g. from a templated .env with no value filled
  // in) is treated the same as the var being absent entirely, rather than
  // failing .min(1) and crashing the whole API on boot.
  FASHN_API_KEY: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional()),
  TRYON_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(3600),
  TRYON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(5),
  // Looser than TRYON_RATE_LIMIT_*: legitimate polling (2s interval, up to
  // 6 chained steps) can add up to dozens of requests per try-on run, but
  // each poll can still trigger a paid provider call, so it isn't unlimited.
  TRYON_STATUS_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(600),
  TRYON_STATUS_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
  // graphql-armor (app.ts) blocks expensive individual queries (deep
  // nesting, high aliasing) but not a high volume of ordinary ones — this
  // is that missing per-client request budget for /graphql, sized more
  // generously than the REST default since catalog browsing/filtering is
  // read-only and naturally bursty.
  GRAPHQL_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  GRAPHQL_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
});

export const env = envSchema.parse(process.env);
