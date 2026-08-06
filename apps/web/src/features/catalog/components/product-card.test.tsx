import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import type { CatalogProduct } from "../api/get-products";
import { ProductCard } from "./product-card";

const product: CatalogProduct = {
  id: "1",
  name: "Chelsea Boots",
  slug: "chelsea-boots",
  category: "shoes",
  priceMinor: 14900,
  currency: "EUR",
  images: ["https://picsum.photos/seed/chelsea-boots-0/800/1000"],
  colors: ["black", "tan"],
  sizes: ["39", "40", "41"],
  styleTags: ["classic", "formal"],
  availability: "in_stock",
};

describe("ProductCard", () => {
  it("renders product details", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("heading", { name: "Chelsea Boots" })).toBeInTheDocument();
    expect(screen.getByText("€149.00")).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
    expect(screen.getByText(/black, tan/i)).toBeInTheDocument();
    expect(screen.getByAltText("Chelsea Boots")).toBeInTheDocument();
  });

  it("shows an out of stock badge when unavailable", () => {
    render(<ProductCard product={{ ...product, availability: "out_of_stock" }} />);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ProductCard product={product} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
