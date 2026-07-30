import { beforeEach, describe, expect, it } from "vitest";

import type { CatalogProduct } from "@/features/catalog/api/get-products";

import { useOutfitStore } from "./outfit-store";

function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "1",
    name: "Denim Jacket",
    slug: "denim-jacket",
    category: "jacket",
    price: 89,
    currency: "EUR",
    images: ["https://picsum.photos/seed/denim-jacket/800/1000"],
    colors: ["indigo", "black"],
    sizes: ["S", "M", "L"],
    styleTags: ["casual"],
    availability: "in_stock",
    ...overrides,
  };
}

describe("useOutfitStore", () => {
  beforeEach(() => {
    useOutfitStore.setState({ items: {} });
  });

  it("starts empty", () => {
    expect(useOutfitStore.getState().items).toEqual({});
  });

  it("adds an item to its category slot, defaulting color and size", () => {
    useOutfitStore.getState().addItem(product());
    const item = useOutfitStore.getState().items.jacket;
    expect(item?.product.id).toBe("1");
    expect(item?.selectedColor).toBe("indigo");
    expect(item?.selectedSize).toBe("S");
  });

  it("replaces the item already in that category rather than duplicating", () => {
    useOutfitStore.getState().addItem(product({ id: "1", name: "Denim Jacket" }));
    useOutfitStore.getState().addItem(product({ id: "2", name: "Wool Blazer" }));

    const items = useOutfitStore.getState().items;
    expect(Object.keys(items)).toEqual(["jacket"]);
    expect(items.jacket?.product.id).toBe("2");
  });

  it("keeps items in different categories independent", () => {
    useOutfitStore.getState().addItem(product({ id: "1", category: "top" }));
    useOutfitStore.getState().addItem(product({ id: "2", category: "bottom" }));

    const items = useOutfitStore.getState().items;
    expect(items.top?.product.id).toBe("1");
    expect(items.bottom?.product.id).toBe("2");
  });

  it("removes an item from its category", () => {
    useOutfitStore.getState().addItem(product({ category: "shoes" }));
    useOutfitStore.getState().removeItem("shoes");
    expect(useOutfitStore.getState().items.shoes).toBeUndefined();
  });

  it("does nothing when removing from an empty category", () => {
    const before = useOutfitStore.getState().items;
    useOutfitStore.getState().removeItem("bag");
    expect(useOutfitStore.getState().items).toEqual(before);
  });

  it("clears all items", () => {
    useOutfitStore.getState().addItem(product({ category: "top" }));
    useOutfitStore.getState().addItem(product({ category: "bottom" }));
    useOutfitStore.getState().clear();
    expect(useOutfitStore.getState().items).toEqual({});
  });
});
