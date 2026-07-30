import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { CatalogProduct } from "@/features/catalog/api/get-products";

import { useOutfitStore } from "../store/outfit-store";
import { AddToOutfitButton } from "./add-to-outfit-button";

function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "1",
    name: "Denim Jacket",
    slug: "denim-jacket",
    category: "jacket",
    price: 89,
    currency: "EUR",
    images: [],
    colors: ["indigo"],
    sizes: ["M"],
    styleTags: ["casual"],
    availability: "in_stock",
    ...overrides,
  };
}

describe("AddToOutfitButton", () => {
  beforeEach(() => {
    useOutfitStore.setState({ items: {} });
  });

  it("adds the product to the outfit store", () => {
    render(<AddToOutfitButton product={product()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to outfit" }));
    expect(useOutfitStore.getState().items.jacket?.product.id).toBe("1");
  });

  it("removes the product once it is already selected", () => {
    useOutfitStore.getState().addItem(product());
    render(<AddToOutfitButton product={product()} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove from outfit" }));
    expect(useOutfitStore.getState().items.jacket).toBeUndefined();
  });

  it("offers to replace a different product already in that category", () => {
    useOutfitStore.getState().addItem(product({ id: "1", name: "Denim Jacket" }));
    render(<AddToOutfitButton product={product({ id: "2", name: "Wool Blazer" })} />);
    expect(screen.getByRole("button", { name: "Replace in outfit" })).toBeInTheDocument();
  });
});
