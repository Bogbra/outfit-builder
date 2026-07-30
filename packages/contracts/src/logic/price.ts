import type { Product } from "../domain/product.js";

export interface PricedOutfitItem {
  product: Pick<Product, "price" | "currency">;
}

export interface OutfitPrice {
  totalPrice: number;
  currency: string | null;
}

export function calculateOutfitTotalPrice(items: readonly PricedOutfitItem[]): OutfitPrice {
  const [first, ...rest] = items;
  if (!first) {
    return { totalPrice: 0, currency: null };
  }

  const currency = first.product.currency;
  const hasMixedCurrency = rest.some((item) => item.product.currency !== currency);
  if (hasMixedCurrency) {
    throw new Error("Cannot calculate a total price across items with different currencies");
  }

  const totalPrice = items.reduce((sum, item) => sum + item.product.price, 0);
  return { totalPrice, currency };
}
