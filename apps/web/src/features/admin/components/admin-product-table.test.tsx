import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import type { AdminProduct } from "../api/get-admin-products";
import { AdminProductTable } from "./admin-product-table";

const products: AdminProduct[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Leather Belt",
    slug: "leather-belt",
    description: "A classic leather belt.",
    category: "accessory",
    price: 39,
    currency: "EUR",
    images: ["https://picsum.photos/seed/leather-belt/800/1000"],
    colors: ["brown"],
    sizes: ["one-size"],
    styleTags: ["minimal"],
    material: "Leather",
    availability: "in_stock",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Wool Beanie",
    slug: "wool-beanie",
    description: "A cozy wool beanie.",
    category: "accessory",
    price: 25,
    currency: "EUR",
    images: [],
    colors: ["grey"],
    sizes: ["one-size"],
    styleTags: [],
    material: "Wool",
    availability: "out_of_stock",
    isActive: false,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("AdminProductTable", () => {
  it("renders product details for every product", () => {
    render(
      <AdminProductTable products={products} sortBy="createdAt" sortDirection="desc" rawSearchParams={{}} />,
    );

    expect(screen.getAllByText("Leather Belt").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Wool Beanie").length).toBeGreaterThan(0);
    expect(screen.getAllByText("€39.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("In stock").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Out of stock").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inactive").length).toBeGreaterThan(0);
  });

  it("links each product to its edit page, once for the desktop table and once for the mobile fallback", () => {
    render(
      <AdminProductTable products={products} sortBy="createdAt" sortDirection="desc" rawSearchParams={{}} />,
    );

    const editLinks = screen
      .getAllByRole("link", { name: "Edit" })
      .filter((link) => link.getAttribute("href") === "/admin/products/11111111-1111-1111-1111-111111111111/edit");
    expect(editLinks).toHaveLength(2);
  });

  it("marks the active sort column with aria-sort", () => {
    render(
      <AdminProductTable products={products} sortBy="price" sortDirection="asc" rawSearchParams={{}} />,
    );

    expect(screen.getByRole("columnheader", { name: /Price/ })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: /Added/ })).toHaveAttribute("aria-sort", "none");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AdminProductTable products={products} sortBy="createdAt" sortDirection="desc" rawSearchParams={{}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
