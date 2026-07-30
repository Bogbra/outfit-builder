import { describe, expect, it } from "vitest";

import { getCompatibilityWarnings } from "./compatibility";

describe("getCompatibilityWarnings", () => {
  it("returns no warnings for a single item", () => {
    const warnings = getCompatibilityWarnings([
      { item: { selectedColor: "black" }, product: { styleTags: ["streetwear"] } },
    ]);
    expect(warnings).toEqual([]);
  });

  it("warns when items share no style tag", () => {
    const warnings = getCompatibilityWarnings([
      { item: { selectedColor: "black" }, product: { styleTags: ["streetwear"] } },
      { item: { selectedColor: "navy" }, product: { styleTags: ["formal"] } },
    ]);
    expect(warnings).toContainEqual(
      expect.objectContaining({ type: "style-overlap", severity: "warning" }),
    );
  });

  it("does not warn about style when items share a tag", () => {
    const warnings = getCompatibilityWarnings([
      { item: { selectedColor: "black" }, product: { styleTags: ["streetwear", "casual"] } },
      { item: { selectedColor: "navy" }, product: { styleTags: ["casual"] } },
    ]);
    expect(warnings.some((warning) => warning.type === "style-overlap")).toBe(false);
  });

  it("warns when more than three distinct colors are used", () => {
    const warnings = getCompatibilityWarnings([
      { item: { selectedColor: "black" }, product: { styleTags: ["casual"] } },
      { item: { selectedColor: "white" }, product: { styleTags: ["casual"] } },
      { item: { selectedColor: "red" }, product: { styleTags: ["casual"] } },
      { item: { selectedColor: "green" }, product: { styleTags: ["casual"] } },
    ]);
    expect(warnings).toContainEqual(expect.objectContaining({ type: "color-count", severity: "warning" }));
  });

  it("does not warn about color count within the limit", () => {
    const warnings = getCompatibilityWarnings([
      { item: { selectedColor: "black" }, product: { styleTags: ["casual"] } },
      { item: { selectedColor: "white" }, product: { styleTags: ["casual"] } },
      { item: { selectedColor: "red" }, product: { styleTags: ["casual"] } },
    ]);
    expect(warnings.some((warning) => warning.type === "color-count")).toBe(false);
  });
});
