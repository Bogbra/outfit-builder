import type { Product } from "../domain/product.js";

export interface PricedOutfitItem {
  product: Pick<Product, "priceMinor" | "currency">;
}

export interface OutfitPrice {
  totalPriceMinor: number;
  currency: string | null;
}

export function calculateOutfitTotalPrice(items: readonly PricedOutfitItem[]): OutfitPrice {
  const [first, ...rest] = items;
  if (!first) {
    return { totalPriceMinor: 0, currency: null };
  }

  const currency = first.product.currency;
  const hasMixedCurrency = rest.some((item) => item.product.currency !== currency);
  if (hasMixedCurrency) {
    throw new Error("Cannot calculate a total price across items with different currencies");
  }

  // Integer minor units sum exactly — no floating-point rounding to worry
  // about the way summing Float prices would have required.
  const totalPriceMinor = items.reduce((sum, item) => sum + item.product.priceMinor, 0);
  return { totalPriceMinor, currency };
}
