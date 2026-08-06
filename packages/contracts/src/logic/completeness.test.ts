import { describe, expect, it } from "vitest";

import { validateOutfitCompleteness } from "./completeness";

describe("validateOutfitCompleteness", () => {
  it("is incomplete when no items are selected", () => {
    const result = validateOutfitCompleteness([]);
    expect(result.isComplete).toBe(false);
    expect(result.missingRequiredCategories).toEqual(["top", "bottom", "shoes"]);
  });

  it("is incomplete when a required category is missing", () => {
    const result = validateOutfitCompleteness([{ category: "top" }, { category: "bottom" }]);
    expect(result.isComplete).toBe(false);
    expect(result.missingRequiredCategories).toEqual(["shoes"]);
  });

  it("is complete once top, bottom and shoes are all selected", () => {
    const result = validateOutfitCompleteness([
      { category: "top" },
      { category: "bottom" },
      { category: "shoes" },
    ]);
    expect(result.isComplete).toBe(true);
    expect(result.missingRequiredCategories).toEqual([]);
  });

  it("stays complete when optional categories are also present", () => {
    const result = validateOutfitCompleteness([
      { category: "top" },
      { category: "bottom" },
      { category: "shoes" },
      { category: "jacket" },
    ]);
    expect(result.isComplete).toBe(true);
  });
});
