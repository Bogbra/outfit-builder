import type { ProductFilters } from "@outfit-builder/contracts";
import { describe, expect, it } from "vitest";

import { buildProductWhereClause } from "./product-repository.js";

const baseFilters: ProductFilters = { page: 1, pageSize: 24 };

describe("buildProductWhereClause", () => {
  it("always restricts results to active products", () => {
    expect(buildProductWhereClause(baseFilters)).toEqual({ isActive: true });
  });

  it("filters by category", () => {
    expect(buildProductWhereClause({ ...baseFilters, category: "shoes" })).toEqual({
      isActive: true,
      category: "shoes",
    });
  });

  it("filters by color, size and style using array containment", () => {
    const where = buildProductWhereClause({
      ...baseFilters,
      color: "black",
      size: "M",
      style: "casual",
    });
    expect(where).toEqual({
      isActive: true,
      colors: { has: "black" },
      sizes: { has: "M" },
      styleTags: { has: "casual" },
    });
  });

  it("builds a price range from minPrice and maxPrice", () => {
    const where = buildProductWhereClause({ ...baseFilters, minPrice: 50, maxPrice: 150 });
    expect(where).toEqual({ isActive: true, price: { gte: 50, lte: 150 } });
  });

  it("builds an open-ended price range when only one bound is given", () => {
    expect(buildProductWhereClause({ ...baseFilters, minPrice: 50 })).toEqual({
      isActive: true,
      price: { gte: 50 },
    });
    expect(buildProductWhereClause({ ...baseFilters, maxPrice: 150 })).toEqual({
      isActive: true,
      price: { lte: 150 },
    });
  });

  it("builds a case-insensitive OR search across name and description", () => {
    const where = buildProductWhereClause({ ...baseFilters, search: "denim" });
    expect(where).toEqual({
      isActive: true,
      OR: [
        { name: { contains: "denim", mode: "insensitive" } },
        { description: { contains: "denim", mode: "insensitive" } },
      ],
    });
  });

  it("combines multiple filters", () => {
    const where = buildProductWhereClause({
      ...baseFilters,
      category: "jacket",
      color: "black",
      search: "bomber",
    });
    expect(where).toEqual({
      isActive: true,
      category: "jacket",
      colors: { has: "black" },
      OR: [
        { name: { contains: "bomber", mode: "insensitive" } },
        { description: { contains: "bomber", mode: "insensitive" } },
      ],
    });
  });
});
