import { describe, expect, it } from "vitest";

import { parseCatalogSearchParams } from "./parse-search-params";

describe("parseCatalogSearchParams", () => {
  it("converts minPrice/maxPrice from major units to minor units", () => {
    const filters = parseCatalogSearchParams({ minPrice: "49.90", maxPrice: "150" });
    expect(filters.minPriceMinor).toBe(4990);
    expect(filters.maxPriceMinor).toBe(15000);
  });

  it("drops an invalid price param instead of throwing, since there's no field to show an error against", () => {
    const filters = parseCatalogSearchParams({ minPrice: "49.999", maxPrice: "not-a-number" });
    expect(filters.minPriceMinor).toBeUndefined();
    expect(filters.maxPriceMinor).toBeUndefined();
  });

  it("leaves price filters unset when absent", () => {
    const filters = parseCatalogSearchParams({});
    expect(filters.minPriceMinor).toBeUndefined();
    expect(filters.maxPriceMinor).toBeUndefined();
  });
});
