import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  // Optional, unlike AUTH_SECRET/DATABASE_URL — this only gates the virtual
  // try-on feature (docs/07-security.md "Virtual try-on"), so a missing key
  // shouldn't crash the whole API on boot. The route itself checks for it
  // and returns 503 if unset, rather than every other endpoint failing too.
  FASHN_API_KEY: z.string().min(1).optional(),
  TRYON_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(3600),
  TRYON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(5),
});

export const env = envSchema.parse(process.env);
