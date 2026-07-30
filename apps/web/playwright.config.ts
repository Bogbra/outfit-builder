import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const rootDir = path.resolve(__dirname, "../..");

const webPort = Number(process.env.E2E_WEB_PORT ?? 3100);
const apiPort = Number(process.env.E2E_API_PORT ?? 8180);
const baseURL = `http://localhost:${webPort}`;
const apiURL = `http://localhost:${apiPort}`;

// Admin credentials for this E2E run only — bcrypt hash of
// "e2e-admin-password-123", precomputed offline (apps/web has no bcrypt
// dependency of its own; this avoids adding one just to hash a constant at
// config-load time). Never used outside this config. See docs/testing.md.
const E2E_ADMIN_EMAIL = "e2e-admin@example.com";
const E2E_ADMIN_PASSWORD = "e2e-admin-password-123";
const E2E_ADMIN_PASSWORD_HASH = "$2a$10$QVAJ2Ejy0sTzFXqCCgRtY.et25J18UBwKdHMzzUop1JLUai2okO1.";

const sharedEnv = {
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5433/outfit_builder",
  NEXT_PUBLIC_APP_URL: baseURL,
  API_URL: apiURL,
  NEXT_PUBLIC_API_URL: apiURL,
  AUTH_SECRET: "e2e-secret-do-not-use-in-production",
  ADMIN_EMAIL: E2E_ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: E2E_ADMIN_PASSWORD_HASH,
  RATE_LIMIT_WINDOW_SECONDS: "60",
  RATE_LIMIT_MAX_REQUESTS: "1000",
};

export { apiURL, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter api dev",
      cwd: rootDir,
      url: `${apiURL}/healthz`,
      env: { ...sharedEnv, PORT: String(apiPort) },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // A production build, not `next dev` — dev mode's floating dev-tools
      // overlay intercepts Playwright's pointer-event clicks, and a smoke
      // test should exercise the real production bundle anyway.
      command: `pnpm --filter web build && pnpm --filter web start --port ${webPort}`,
      cwd: rootDir,
      url: baseURL,
      env: sharedEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
