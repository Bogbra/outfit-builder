import { describe, expect, it } from "vitest";

import { createOutfitInputSchema } from "./outfit";
import { outfitItemSchema } from "./outfit-item";

const item = (category: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  productId: "8c5f1e2a-6b3d-4a2e-9c1a-2f3b4c5d6e7f",
  category,
  selectedColor: "black",
  selectedSize: "M",
  ...overrides,
});

describe("outfitItemSchema", () => {
  it("accepts a valid item", () => {
    expect(outfitItemSchema.safeParse(item("top")).success).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(outfitItemSchema.safeParse(item("hat")).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(outfitItemSchema.safeParse(item("top", { note: "gift" })).success).toBe(false);
  });
});

describe("createOutfitInputSchema", () => {
  it("accepts one item per category", () => {
    const result = createOutfitInputSchema.safeParse({
      name: "Weekend brunch",
      items: [item("top"), item("bottom"), item("shoes")],
    });
    expect(result.success).toBe(true);
  });

  it("rejects two items in the same category", () => {
    const result = createOutfitInputSchema.safeParse({
      name: "Weekend brunch",
      items: [item("top"), item("top")],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty items array", () => {
    const result = createOutfitInputSchema.safeParse({ name: "Weekend brunch", items: [] });
    expect(result.success).toBe(false);
  });
});
