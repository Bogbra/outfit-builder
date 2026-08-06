import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import type { CatalogProduct } from "@/features/catalog/api/get-products";

import { useOutfitStore } from "../store/outfit-store";
import { SaveOutfitDialog } from "./save-outfit-dialog";

const saveOutfitMock = vi.fn();

vi.mock("../api/save-outfit", () => ({
  saveOutfit: (...args: unknown[]) => saveOutfitMock(...args),
}));

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

describe("SaveOutfitDialog", () => {
  beforeEach(() => {
    saveOutfitMock.mockReset();
    useOutfitStore.setState({ items: {} });
  });

  it("disables the trigger when the outfit has no items", () => {
    render(<SaveOutfitDialog items={[]} />);
    expect(screen.getByRole("button", { name: "Save outfit" })).toBeDisabled();
  });

  it("shows a validation error and does not call the API when the name is only whitespace", async () => {
    // The native `required` attribute blocks submission of a fully empty
    // field before React ever sees the event, so this exercises the only
    // path that still reaches the component's own trim() check.
    useOutfitStore.getState().addItem(product());
    render(<SaveOutfitDialog items={[{ product: product(), selectedColor: "indigo", selectedSize: "M" }]} />);

    fireEvent.click(screen.getByRole("button", { name: "Save outfit" }));
    fireEvent.change(await screen.findByLabelText(/Outfit name/), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Give your outfit a name")).toBeInTheDocument();
    expect(saveOutfitMock).not.toHaveBeenCalled();
  });

  it("saves the outfit and clears the store on success", async () => {
    saveOutfitMock.mockResolvedValue({ id: "outfit-1" });
    useOutfitStore.getState().addItem(product());
    const items = [{ product: product(), selectedColor: "indigo", selectedSize: "M" }];
    render(<SaveOutfitDialog items={items} />);

    fireEvent.click(screen.getByRole("button", { name: "Save outfit" }));
    fireEvent.change(await screen.findByLabelText(/Outfit name/), { target: { value: "Weekend brunch" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saveOutfitMock).toHaveBeenCalledTimes(1));
    expect(saveOutfitMock).toHaveBeenCalledWith({
      name: "Weekend brunch",
      items: [{ productId: "1", category: "jacket", selectedColor: "indigo", selectedSize: "M" }],
    });
    await waitFor(() => expect(useOutfitStore.getState().items).toEqual({}));
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SaveOutfitDialog items={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
