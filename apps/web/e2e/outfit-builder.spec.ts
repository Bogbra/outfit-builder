import { expect, test } from "@playwright/test";

// CLAUDE.md Testing Rules: "E2E smoke test for building and saving an
// outfit." Exercises the real stack (apps/web + apps/api + Postgres),
// not mocks — see playwright.config.ts webServer.
//
// Category switches and the outfit-builder navigation use UI clicks
// (client-side transitions), never page.goto(), because the outfit store
// is plain in-memory Zustand with no persistence — a full page load wipes
// it, same as a real user's state resets on a hard refresh.
test("user builds a complete outfit and saves it", async ({ page }) => {
  const outfitName = `E2E Outfit ${Date.now()}`;

  await page.goto("/");

  for (const category of ["Top", "Bottom", "Shoes"]) {
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: category }).click();
    await page.getByRole("button", { name: "Add to outfit" }).first().click();
  }

  const mainNav = page.getByRole("navigation", { name: "Main" });
  await mainNav.getByRole("link", { name: "Outfit" }).click();
  await expect(page.getByText("Complete", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Save outfit" }).click();
  await page.getByLabel("Outfit name", { exact: false }).fill(outfitName);
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Outfit saved", { exact: true })).toBeVisible();

  await mainNav.getByRole("link", { name: "Saved" }).click();
  await expect(page.getByRole("heading", { name: outfitName })).toBeVisible();
});
