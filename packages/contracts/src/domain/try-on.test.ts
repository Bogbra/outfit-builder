import { describe, expect, it } from "vitest";

import { tryOnRequestInputSchema, tryOnResponseSchema } from "./try-on";

const VALID_PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
const item = (category: string) => ({ productId: "8c5f1e2a-6b3d-4a2e-9c1a-2f3b4c5d6e7f", category });

describe("tryOnRequestInputSchema", () => {
  it("accepts a valid single-item request", () => {
    const result = tryOnRequestInputSchema.safeParse({ photo: VALID_PHOTO, items: [item("top")] });
    expect(result.success).toBe(true);
  });

  it("accepts up to 6 items, one per category", () => {
    const result = tryOnRequestInputSchema.safeParse({
      photo: VALID_PHOTO,
      items: ["top", "bottom", "shoes", "jacket", "bag", "accessory"].map(item),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a photo that isn't a base64 image data URL", () => {
    const result = tryOnRequestInputSchema.safeParse({
      photo: "https://example.com/photo.jpg",
      items: [item("top")],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty items array", () => {
    const result = tryOnRequestInputSchema.safeParse({ photo: VALID_PHOTO, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects two items in the same category", () => {
    const result = tryOnRequestInputSchema.safeParse({ photo: VALID_PHOTO, items: [item("top"), item("top")] });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = tryOnRequestInputSchema.safeParse({ photo: VALID_PHOTO, items: [item("top")], note: "hi" });
    expect(result.success).toBe(false);
  });
});

describe("tryOnResponseSchema", () => {
  it("accepts a processing response with no result yet", () => {
    const result = tryOnResponseSchema.safeParse({
      id: "8c5f1e2a-6b3d-4a2e-9c1a-2f3b4c5d6e7f",
      status: "processing",
      step: 1,
      totalSteps: 3,
      resultImageUrl: null,
      error: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = tryOnResponseSchema.safeParse({
      id: "8c5f1e2a-6b3d-4a2e-9c1a-2f3b4c5d6e7f",
      status: "queued",
      step: 0,
      totalSteps: 1,
      resultImageUrl: null,
      error: null,
    });
    expect(result.success).toBe(false);
  });
});
