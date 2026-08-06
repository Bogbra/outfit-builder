import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import type { AdminProduct } from "../api/get-admin-products";
import { AdminProductForm } from "./admin-product-form";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const createProductMock = vi.fn();
const updateProductMock = vi.fn();

vi.mock("../api/create-product", () => ({
  createProduct: (...args: unknown[]) => createProductMock(...args),
}));
vi.mock("../api/update-product", () => ({
  updateProduct: (...args: unknown[]) => updateProductMock(...args),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Denim Jacket" } });
  fireEvent.change(screen.getByLabelText(/^Price/), { target: { value: "89.9" } });
  fireEvent.change(screen.getByLabelText(/^Material/), { target: { value: "Denim" } });
  fireEvent.change(screen.getByLabelText(/^Image URLs/), {
    target: { value: "https://images.unsplash.com/image.jpg" },
  });
  fireEvent.change(screen.getByLabelText(/^Colors/), { target: { value: "Blue" } });
  fireEvent.change(screen.getByLabelText(/^Sizes/), { target: { value: "M" } });
}

function existingProduct(overrides: Partial<AdminProduct> = {}): AdminProduct {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Leather Belt",
    slug: "leather-belt",
    description: "A classic leather belt.",
    category: "accessory",
    priceMinor: 3900,
    currency: "EUR",
    images: ["https://images.unsplash.com/belt.jpg"],
    colors: ["brown"],
    sizes: ["one-size"],
    styleTags: ["minimal"],
    material: "Leather",
    availability: "in_stock",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("AdminProductForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createProductMock.mockReset();
    updateProductMock.mockReset();
  });

  it("shows validation errors and does not submit when required fields are empty", async () => {
    render(<AdminProductForm mode="create" />);
    fireEvent.click(screen.getByRole("button", { name: "Create product" }));

    expect(await screen.findByText("Add at least one image URL")).toBeInTheDocument();
    expect(screen.getByText("Add at least one color")).toBeInTheDocument();
    expect(screen.getByText("Add at least one size")).toBeInTheDocument();
    expect(createProductMock).not.toHaveBeenCalled();
  });

  it("creates a product with the parsed form data on valid submit", async () => {
    createProductMock.mockResolvedValue({ id: "new-id" });
    render(<AdminProductForm mode="create" />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Create product" }));

    await waitFor(() => expect(createProductMock).toHaveBeenCalledTimes(1));
    const [input] = createProductMock.mock.calls[0]!;
    expect(input).toMatchObject({
      name: "Denim Jacket",
      slug: "denim-jacket",
      priceMinor: 8990,
      material: "Denim",
      images: ["https://images.unsplash.com/image.jpg"],
      colors: ["Blue"],
      sizes: ["M"],
    });
    expect(pushMock).toHaveBeenCalledWith("/admin/products");
  });

  it("pre-fills fields from the product prop in edit mode", () => {
    render(<AdminProductForm mode="edit" product={existingProduct()} />);

    expect(screen.getByLabelText(/^Name/)).toHaveValue("Leather Belt");
    expect(screen.getByLabelText(/^Slug/)).toHaveValue("leather-belt");
    expect(screen.getByLabelText(/^Material/)).toHaveValue("Leather");
    expect(screen.getByLabelText(/^Colors/)).toHaveValue("brown");
  });

  it("calls updateProduct with the product id in edit mode", async () => {
    updateProductMock.mockResolvedValue({ id: "11111111-1111-1111-1111-111111111111" });
    render(<AdminProductForm mode="edit" product={existingProduct()} />);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(updateProductMock).toHaveBeenCalledTimes(1));
    expect(updateProductMock).toHaveBeenCalledWith("11111111-1111-1111-1111-111111111111", expect.any(Object));
  });

  it("shows a form-level error and does not navigate when the API call fails", async () => {
    createProductMock.mockRejectedValue(new Error('A product with the slug "denim-jacket" already exists'));
    render(<AdminProductForm mode="create" />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Create product" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("already exists");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AdminProductForm mode="create" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not render a preview for an image URL on a disallowed host, and shows a validation message instead", () => {
    const { container } = render(<AdminProductForm mode="create" />);

    fireEvent.change(screen.getByLabelText(/^Image URLs/), {
      target: { value: "https://evil.example.com/photo.jpg" },
    });

    // The preview <img> is decorative (alt=""), so it has no accessible
    // "img" role to query by — a plain DOM query is the right tool here.
    expect(container.querySelector("img")).not.toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/not on an allowed image host/i);
    expect(alert).toHaveTextContent("evil.example.com");
  });

  it("renders a preview for an image URL on an allowed host", () => {
    const { container } = render(<AdminProductForm mode="create" />);

    fireEvent.change(screen.getByLabelText(/^Image URLs/), {
      target: { value: "https://images.unsplash.com/photo.jpg" },
    });

    expect(container.querySelector("img")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
