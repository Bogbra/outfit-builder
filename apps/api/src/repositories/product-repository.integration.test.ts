import type { ProductFilters } from "@outfit-builder/contracts";
import { beforeAll, describe, expect, it } from "vitest";

import { getProductBySlug, listProducts } from "./product-repository.js";

// Runs against the real local Postgres (docker compose up postgres, then
// prisma migrate + db seed) — see README.md "Getting Started". Skipped
// automatically if DATABASE_URL isn't set, e.g. in environments without a
// database available.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

function filters(overrides: Partial<ProductFilters> = {}): ProductFilters {
  return { page: 1, pageSize: 24, ...overrides };
}

describeIfDb("product repository (integration)", () => {
  beforeAll(() => {
    if (!hasDatabase) {
      throw new Error("DATABASE_URL must be set to run product repository integration tests");
    }
  });

  it("lists active seeded products with pagination metadata", async () => {
    const page = await listProducts(filters());
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((product) => product.isActive)).toBe(true);
    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(24);
  });

  it("filters by category", async () => {
    const page = await listProducts(filters({ category: "shoes" }));
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.every((product) => product.category === "shoes")).toBe(true);
  });

  it("filters by search term across name and description", async () => {
    const page = await listProducts(filters({ search: "denim" }));
    expect(page.total).toBeGreaterThan(0);
    for (const product of page.items) {
      const haystack = `${product.name} ${product.description}`.toLowerCase();
      expect(haystack).toContain("denim");
    }
  });

  it("returns an empty page for a search with no matches", async () => {
    const page = await listProducts(filters({ search: "zzz-not-a-real-product-zzz" }));
    expect(page.total).toBe(0);
    expect(page.items).toEqual([]);
  });

  it("paginates results", async () => {
    const firstPage = await listProducts(filters({ pageSize: 5, page: 1 }));
    const secondPage = await listProducts(filters({ pageSize: 5, page: 2 }));
    expect(firstPage.items).toHaveLength(5);
    expect(secondPage.items.length).toBeGreaterThan(0);
    const firstIds = new Set(firstPage.items.map((product) => product.id));
    for (const product of secondPage.items) {
      expect(firstIds.has(product.id)).toBe(false);
    }
  });

  it("gets a product by slug", async () => {
    const product = await getProductBySlug("chelsea-boots");
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Chelsea Boots");
  });

  it("returns null for an unknown slug", async () => {
    const product = await getProductBySlug("does-not-exist");
    expect(product).toBeNull();
  });
});
