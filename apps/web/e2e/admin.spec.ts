import { expect, test } from "@playwright/test";

import { apiURL, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../playwright.config";

// Smoke test for the other major flow this app has: admin auth + a write
// path behind it. Exercises the real stack, not mocks.
test("admin logs in and creates a product", async ({ page }) => {
  const productName = `E2E Product ${Date.now()}`;

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: "Products" }).click();
  await page.getByRole("link", { name: "New product" }).click();

  await page.getByLabel("Name", { exact: false }).fill(productName);
  await page.getByLabel("Price", { exact: false }).fill("49.99");
  await page.getByLabel("Material", { exact: false }).fill("Cotton");
  await page.getByLabel("Image URLs", { exact: false }).fill("https://picsum.photos/seed/e2e-product/800/1000");
  await page.getByLabel("Colors", { exact: false }).fill("black");
  await page.getByLabel("Sizes", { exact: false }).fill("One Size");

  await page.getByRole("button", { name: "Create product" }).click();

  await expect(page).toHaveURL(/\/admin\/products$/);
  // Scoped to the desktop table specifically — the product list also
  // renders a CSS-hidden mobile card variant with the same text, and a
  // still-visible "product created" toast also contains the product name.
  await expect(page.locator("table").getByText(productName)).toBeVisible();
});

// Proves logout does more than clear the browser cookie — the JWT itself
// gets revoked server-side (apps/api's AdminSession table), so a captured
// token can't still be replayed against the API after the user logs out.
test("logout revokes the session token, not just the browser cookie", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const cookiesBeforeLogout = await page.context().cookies();
  const sessionCookie = cookiesBeforeLogout.find((cookie) => cookie.name === "admin_session");
  expect(sessionCookie).toBeDefined();
  const token = sessionCookie!.value;

  const beforeLogout = await page.request.get(`${apiURL}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(beforeLogout.status()).toBe(200);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  const afterLogout = await page.request.get(`${apiURL}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(afterLogout.status()).toBe(401);
});
