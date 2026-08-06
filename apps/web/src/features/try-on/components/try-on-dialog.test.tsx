import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import type { CatalogProduct } from "@/features/catalog/api/get-products";
import type { OutfitStoreItem } from "@/features/outfit-builder/store/outfit-store";

import { TryOnDialog } from "./try-on-dialog";

const startTryOnMock = vi.fn();
const getTryOnStatusMock = vi.fn();

vi.mock("../api/start-try-on", () => ({
  startTryOn: (...args: unknown[]) => startTryOnMock(...args),
}));
vi.mock("../api/get-try-on-status", () => ({
  getTryOnStatus: (...args: unknown[]) => getTryOnStatusMock(...args),
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

const items: OutfitStoreItem[] = [{ product: product(), selectedColor: "indigo", selectedSize: "M" }];

function imageFile(name = "photo.jpg", type = "image/jpeg") {
  return new File(["fake-image-bytes"], name, { type });
}

describe("TryOnDialog", () => {
  beforeEach(() => {
    startTryOnMock.mockReset();
    getTryOnStatusMock.mockReset();
    // jsdom doesn't implement createObjectURL/revokeObjectURL — a real
    // browser does, this is purely an environment gap (same category as
    // jsdom's missing HTMLCanvasElement.getContext elsewhere in this suite).
    URL.createObjectURL = vi.fn(() => "blob:mock-preview-url");
    URL.revokeObjectURL = vi.fn();
  });

  it("disables the trigger when the outfit has no items", () => {
    render(<TryOnDialog items={[]} />);
    expect(screen.getByRole("button", { name: "Try it on" })).toBeDisabled();
  });

  it("disables the trigger when the outfit only has categories fashn.ai's model doesn't support", () => {
    const shoesOnly: OutfitStoreItem[] = [
      { product: product({ id: "2", category: "shoes" }), selectedColor: "indigo", selectedSize: "M" },
    ];
    render(<TryOnDialog items={shoesOnly} />);
    expect(screen.getByRole("button", { name: "Try it on" })).toBeDisabled();
  });

  it("excludes shoes/bag/accessory items from the request and shows a note", async () => {
    startTryOnMock.mockResolvedValue({
      id: "try-on-3",
      status: "processing",
      step: 1,
      totalSteps: 1,
      resultImageUrl: null,
      error: null,
    });
    getTryOnStatusMock.mockResolvedValue({
      id: "try-on-3",
      status: "processing",
      step: 1,
      totalSteps: 1,
      resultImageUrl: null,
      error: null,
    });

    const mixed: OutfitStoreItem[] = [
      ...items,
      { product: product({ id: "2", category: "shoes" }), selectedColor: "tan", selectedSize: "42" },
    ];
    render(<TryOnDialog items={mixed} />);
    fireEvent.click(screen.getByRole("button", { name: "Try it on" }));

    expect(
      await screen.findByText(/1 item in this outfit isn't shown in the try-on preview/),
    ).toBeInTheDocument();

    const fileInput = await screen.findByLabelText(/Your photo/);
    fireEvent.change(fileInput, { target: { files: [imageFile()] } });
    const submitButtons = await screen.findAllByRole("button", { name: "Try it on" });
    fireEvent.click(submitButtons[submitButtons.length - 1]!);

    await waitFor(() => expect(startTryOnMock).toHaveBeenCalledTimes(1));
    expect(startTryOnMock).toHaveBeenCalledWith(
      expect.objectContaining({ items: [{ productId: "1", category: "jacket" }] }),
    );
  });

  it("rejects a non-image file without calling the API", async () => {
    render(<TryOnDialog items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Try it on" }));

    const fileInput = await screen.findByLabelText(/Your photo/);
    fireEvent.change(fileInput, { target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] } });

    expect(await screen.findByText("Use a JPEG, PNG or WebP photo")).toBeInTheDocument();
    expect(startTryOnMock).not.toHaveBeenCalled();
  });

  it("accepts a photo dropped onto the dropzone", async () => {
    render(<TryOnDialog items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Try it on" }));

    const fileInput = await screen.findByLabelText(/Your photo/);
    const dropzone = fileInput.parentElement!;
    const file = imageFile("dropped-photo.png", "image/png");

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(await screen.findByText("dropped-photo.png")).toBeInTheDocument();
    expect(screen.queryByText("Use a JPEG, PNG or WebP photo")).not.toBeInTheDocument();
  });

  it("rejects a dropped file of the wrong type", async () => {
    render(<TryOnDialog items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Try it on" }));

    const fileInput = await screen.findByLabelText(/Your photo/);
    const dropzone = fileInput.parentElement!;

    fireEvent.drop(dropzone, { dataTransfer: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] } });

    expect(await screen.findByText("Use a JPEG, PNG or WebP photo")).toBeInTheDocument();
    expect(startTryOnMock).not.toHaveBeenCalled();
  });

  it("starts a try-on with the uploaded photo and the outfit's items", async () => {
    startTryOnMock.mockResolvedValue({
      id: "try-on-1",
      status: "processing",
      step: 1,
      totalSteps: 1,
      resultImageUrl: null,
      error: null,
    });
    getTryOnStatusMock.mockResolvedValue({
      id: "try-on-1",
      status: "processing",
      step: 1,
      totalSteps: 1,
      resultImageUrl: null,
      error: null,
    });

    render(<TryOnDialog items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Try it on" }));

    const fileInput = await screen.findByLabelText(/Your photo/);
    fireEvent.change(fileInput, { target: { files: [imageFile()] } });

    const submitButtons = await screen.findAllByRole("button", { name: "Try it on" });
    fireEvent.click(submitButtons[submitButtons.length - 1]!);

    await waitFor(() => expect(startTryOnMock).toHaveBeenCalledTimes(1));
    expect(startTryOnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ productId: "1", category: "jacket" }],
        photo: expect.stringMatching(/^data:image\/jpeg;base64,/),
      }),
    );
    expect(await screen.findByText(/Trying on 1 of 1/)).toBeInTheDocument();
  });

  it("shows the result image once the try-on completes", async () => {
    startTryOnMock.mockResolvedValue({
      id: "try-on-2",
      status: "processing",
      step: 1,
      totalSteps: 1,
      resultImageUrl: null,
      error: null,
    });
    getTryOnStatusMock.mockResolvedValue({
      id: "try-on-2",
      status: "completed",
      step: 1,
      totalSteps: 1,
      resultImageUrl: "https://cdn.fashn.ai/result.png",
      error: null,
    });

    render(<TryOnDialog items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Try it on" }));

    const fileInput = await screen.findByLabelText(/Your photo/);
    fireEvent.change(fileInput, { target: { files: [imageFile()] } });
    const submitButtons = await screen.findAllByRole("button", { name: "Try it on" });
    fireEvent.click(submitButtons[submitButtons.length - 1]!);

    expect(await screen.findByAltText("You wearing this outfit")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<TryOnDialog items={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
