import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { CatalogProduct } from "@/features/catalog/api/get-products";
import { useOutfitStore } from "@/features/outfit-builder/store/outfit-store";

import { OutfitCountBadge } from "./outfit-count-badge";

function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "1",
    name: "Denim Jacket",
    slug: "denim-jacket",
    category: "jacket",
    priceMinor: 8900,
    currency: "EUR",
    images: [],
    colors: ["indigo"],
    sizes: ["M"],
    styleTags: ["casual"],
    availability: "in_stock",
    ...overrides,
  };
}

describe("OutfitCountBadge", () => {
  beforeEach(() => {
    useOutfitStore.setState({ items: {} });
  });

  it("announces no items selected when the outfit is empty", () => {
    render(<OutfitCountBadge />);
    expect(screen.getByText(", no items selected")).toBeInTheDocument();
  });

  it("shows the count and pluralizes the sr-only text for multiple items", () => {
    useOutfitStore.getState().addItem(product({ category: "jacket" }));
    useOutfitStore.getState().addItem(product({ id: "2", category: "top" }));
    render(<OutfitCountBadge />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(", 2 items selected")).toBeInTheDocument();
  });

  it("uses singular sr-only text for exactly one item", () => {
    useOutfitStore.getState().addItem(product());
    render(<OutfitCountBadge />);
    expect(screen.getByText(", 1 item selected")).toBeInTheDocument();
  });
});
