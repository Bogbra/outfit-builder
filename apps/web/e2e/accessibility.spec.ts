import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../playwright.config";

// Closes a real gap: vitest-axe's color-contrast rule can't run under jsdom
// (needs HTMLCanvasElement.getContext, which jsdom doesn't implement), so
// every component test's a11y check silently skips contrast. This runs axe
// in a real browser instead, where contrast checking actually works.
test.describe("accessibility (real browser axe scan)", () => {
  test("catalog page has no automatically detectable a11y violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("outfit builder page has no automatically detectable a11y violations", async ({ page }) => {
    await page.goto("/outfit-builder");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("admin login page has no automatically detectable a11y violations", async ({ page }) => {
    await page.goto("/admin/login");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("admin dashboard has no automatically detectable a11y violations", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    // Waits for the actual settled content, not just the URL change — the
    // client-side transition + router.refresh() briefly renders an
    // intermediate state, which otherwise flakes the axe scan (e.g.
    // catching the page before its <h1>/<title> have committed). The
    // heading alone wasn't a strong enough signal: <title> can still commit
    // a tick later, which axe's document-title rule then flags.
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page).toHaveTitle(/Outfit Builder/);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
