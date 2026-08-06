import { describe, expect, it } from "vitest";

import { calculateOutfitTotalPrice } from "./price";

describe("calculateOutfitTotalPrice", () => {
  it("returns zero and no currency for an empty outfit", () => {
    expect(calculateOutfitTotalPrice([])).toEqual({ totalPriceMinor: 0, currency: null });
  });

  it("sums item prices in a single currency", () => {
    const result = calculateOutfitTotalPrice([
      { product: { priceMinor: 4999, currency: "EUR" } },
      { product: { priceMinor: 8900, currency: "EUR" } },
      { product: { priceMinor: 12000, currency: "EUR" } },
    ]);
    expect(result).toEqual({ totalPriceMinor: 25899, currency: "EUR" });
  });

  it("throws when items use different currencies", () => {
    expect(() =>
      calculateOutfitTotalPrice([
        { product: { priceMinor: 4999, currency: "EUR" } },
        { product: { priceMinor: 6000, currency: "USD" } },
      ]),
    ).toThrow(/different currencies/);
  });
});
