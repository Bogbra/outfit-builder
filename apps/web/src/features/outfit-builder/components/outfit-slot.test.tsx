import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import type { CatalogProduct } from "@/features/catalog/api/get-products";

import { useOutfitStore } from "../store/outfit-store";
import { OutfitSlot } from "./outfit-slot";

const product: CatalogProduct = {
  id: "1",
  name: "Denim Jacket",
  slug: "denim-jacket",
  category: "jacket",
  price: 89,
  currency: "EUR",
  images: ["https://picsum.photos/seed/denim-jacket/800/1000"],
  colors: ["indigo"],
  sizes: ["M"],
  styleTags: ["casual"],
  availability: "in_stock",
};

describe("OutfitSlot", () => {
  beforeEach(() => {
    useOutfitStore.setState({ items: {} });
  });

  it("shows an empty placeholder and an optional label when no item is selected", () => {
    render(<OutfitSlot category="jacket" required={false} item={undefined} />);
    expect(screen.getByText(/no jacket selected/i)).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("does not show the optional label for required categories", () => {
    render(<OutfitSlot category="top" required item={undefined} />);
    expect(screen.queryByText("Optional")).not.toBeInTheDocument();
  });

  it("shows the selected product and removes it from the store on click", () => {
    useOutfitStore.getState().addItem(product);
    const item = useOutfitStore.getState().items.jacket;

    render(<OutfitSlot category="jacket" required={false} item={item} />);

    expect(screen.getByText("Denim Jacket")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove denim jacket/i }));
    expect(useOutfitStore.getState().items.jacket).toBeUndefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<OutfitSlot category="jacket" required={false} item={undefined} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
