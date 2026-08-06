import { z } from "zod";

// This module is imported from both Server and Client Components (e.g. the
// save/delete outfit REST calls run client-side), so it must only validate
// vars that are actually readable in the browser bundle or have a safe
// default — anything server-only (like AUTH_SECRET) belongs in a
// server-only module instead, since `NEXT_PUBLIC_`-unprefixed vars are
// `undefined` in the client bundle and would fail `.parse()` there.
// AUTH_SECRET itself is read directly via `process.env.AUTH_SECRET` in
// proxy.ts (Edge runtime, server-only) rather than through this module.
const envSchema = z.object({
  // Server-only — used by Server Components (e.g. the catalog page fetch).
  API_URL: z.string().url().default("http://localhost:8080"),
  // Inlined into the browser bundle — used by Client Components (e.g. the
  // save/delete outfit REST calls), since API_URL is not readable there.
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080"),
});

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
