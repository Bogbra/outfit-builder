import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// env.ts validates process.env as a side effect of being imported, so each
// scenario here resets the module registry and re-imports it under a fresh
// process.env rather than importing it once at the top of the file.
const REQUIRED_ENV = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/test",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD_HASH: "$2a$10$abcdefghijklmnopqrstuv",
  AUTH_SECRET: "test-secret-that-is-at-least-32-characters-long", // gitleaks:allow — not a real secret, just a long test fixture string
};

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, ...REQUIRED_ENV };
    delete process.env.FASHN_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("boots successfully when FASHN_API_KEY is unset", async () => {
    const { env } = await import("./env.js");
    expect(env.FASHN_API_KEY).toBeUndefined();
  });

  it("boots successfully when FASHN_API_KEY is an empty string, normalizing it to undefined", async () => {
    process.env.FASHN_API_KEY = "";
    const { env } = await import("./env.js");
    expect(env.FASHN_API_KEY).toBeUndefined();
  });

  it("keeps a real FASHN_API_KEY value", async () => {
    process.env.FASHN_API_KEY = "real-key";
    const { env } = await import("./env.js");
    expect(env.FASHN_API_KEY).toBe("real-key");
  });
});
