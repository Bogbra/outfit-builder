import { describe, expect, it } from "vitest";

import { calculateOutfitTotalPrice } from "./price";

describe("calculateOutfitTotalPrice", () => {
  it("returns zero and no currency for an empty outfit", () => {
    expect(calculateOutfitTotalPrice([])).toEqual({ totalPrice: 0, currency: null });
  });

  it("sums item prices in a single currency", () => {
    const result = calculateOutfitTotalPrice([
      { product: { price: 49.99, currency: "EUR" } },
      { product: { price: 89, currency: "EUR" } },
      { product: { price: 120, currency: "EUR" } },
    ]);
    expect(result).toEqual({ totalPrice: 258.99, currency: "EUR" });
  });

  it("throws when items use different currencies", () => {
    expect(() =>
      calculateOutfitTotalPrice([
        { product: { price: 49.99, currency: "EUR" } },
        { product: { price: 60, currency: "USD" } },
      ]),
    ).toThrow(/different currencies/);
  });
});
