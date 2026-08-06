import { describe, expect, it } from "vitest";

import { parsePriceInputToMinor } from "./parse-price-input";

describe("parsePriceInputToMinor", () => {
  it.each([
    ["49", 4900],
    ["49.9", 4990],
    ["49.90", 4990],
    ["0", 0],
    ["0.01", 1],
    ["  49.90  ", 4990],
  ])("accepts %s -> %i minor units", (input, expected) => {
    const result = parsePriceInputToMinor(input);
    expect(result).toEqual({ success: true, valueMinor: expected });
  });

  it.each([
    ["49.999", "more than two decimal places"],
    ["-5", "negative"],
    ["", "empty"],
    ["abc", "non-numeric"],
    ["1e10", "scientific notation"],
    ["4.9e1", "scientific notation"],
    ["100000.01", "outside the allowed range"],
    ["Infinity", "non-numeric"],
    ["NaN", "non-numeric"],
  ])("rejects %s (%s)", (input) => {
    const result = parsePriceInputToMinor(input);
    expect(result.success).toBe(false);
  });

  it("accepts the maximum allowed value", () => {
    expect(parsePriceInputToMinor("100000").success).toBe(true);
    expect(parsePriceInputToMinor("100000.00").success).toBe(true);
  });

  it("returns a specific, actionable message for an invalid decimal precision", () => {
    const result = parsePriceInputToMinor("49.999");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("2 decimal places");
    }
  });
});
