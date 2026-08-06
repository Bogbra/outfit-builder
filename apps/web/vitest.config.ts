import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    // Playwright owns ./e2e (its own test() / expect(), a different
    // fixture-based runner) — vitest's default include pattern would
    // otherwise also pick up these *.spec.ts files and fail to run them.
    exclude: [...configDefaults.exclude, "**/e2e/**"],
  },
});
