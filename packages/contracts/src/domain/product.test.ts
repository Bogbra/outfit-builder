import { describe, expect, it } from "vitest";

import { ALLOWED_IMAGE_HOSTS } from "./image-hosts";
import {
  adminProductFormSchema,
  adminProductUpdateSchema,
  MAX_PRICE_MINOR,
  productFiltersSchema,
  productSchema,
} from "./product";

const validProduct = {
  id: "8c5f1e2a-6b3d-4a2e-9c1a-2f3b4c5d6e7f",
  name: "Denim Jacket",
  slug: "denim-jacket",
  description: "Classic fit, indigo wash.",
  category: "jacket",
  priceMinor: 8900,
  currency: "EUR",
  images: ["https://images.unsplash.com/denim-jacket.jpg"],
  colors: ["indigo"],
  sizes: ["S", "M", "L"],
  styleTags: ["casual"],
  material: "Cotton",
  availability: "in_stock",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("productSchema", () => {
  it("accepts a valid product", () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects a slug with uppercase or spaces", () => {
    const result = productSchema.safeParse({ ...validProduct, slug: "Denim Jacket" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, priceMinor: -10 });
    expect(result.success).toBe(false);
  });

  it("accepts a price at the maximum bound", () => {
    const result = productSchema.safeParse({ ...validProduct, priceMinor: MAX_PRICE_MINOR });
    expect(result.success).toBe(true);
  });

  it("rejects a price above the maximum bound (Postgres int4 safety)", () => {
    const result = productSchema.safeParse({ ...validProduct, priceMinor: MAX_PRICE_MINOR + 1 });
    expect(result.success).toBe(false);
  });

  it("rejects an empty images array", () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an image URL from a host that isn't in the allowlist", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      images: ["https://example.com/denim-jacket.jpg"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an allowed host over plain http", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      images: ["http://images.unsplash.com/denim-jacket.jpg"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts every currently allowed image host", () => {
    for (const host of ALLOWED_IMAGE_HOSTS) {
      const result = productSchema.safeParse({ ...validProduct, images: [`https://${host}/photo.jpg`] });
      expect(result.success).toBe(true);
    }
  });
});

describe("adminProductFormSchema", () => {
  const validForm = {
    name: "Denim Jacket",
    slug: "denim-jacket",
    description: "Classic fit, indigo wash.",
    category: "jacket",
    priceMinor: 8900,
    currency: "EUR",
    images: ["https://images.unsplash.com/denim-jacket.jpg"],
    colors: ["indigo"],
    sizes: ["S", "M", "L"],
    material: "Cotton",
    availability: "in_stock",
  };

  it("accepts a valid form and applies defaults", () => {
    const result = adminProductFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.styleTags).toEqual([]);
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects unknown fields", () => {
    const result = adminProductFormSchema.safeParse({ ...validForm, internalNotes: "discount pending" });
    expect(result.success).toBe(false);
  });

  it("rejects an image URL from a host that isn't in the allowlist, with a message naming the host", () => {
    const result = adminProductFormSchema.safeParse({
      ...validForm,
      images: ["https://evil.example.com/photo.jpg"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("evil.example.com");
    }
  });
});

describe("adminProductUpdateSchema", () => {
  it("accepts a partial update with a single field", () => {
    const result = adminProductUpdateSchema.safeParse({ priceMinor: 9900 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ priceMinor: 9900 });
    }
  });

  it("accepts an empty object (no-op update)", () => {
    expect(adminProductUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("rejects unknown fields", () => {
    const result = adminProductUpdateSchema.safeParse({ priceMinor: 9900, internalNotes: "x" });
    expect(result.success).toBe(false);
  });

  it("still enforces field-level rules when a field is present", () => {
    const result = adminProductUpdateSchema.safeParse({ priceMinor: -5 });
    expect(result.success).toBe(false);
  });
});

describe("productFiltersSchema", () => {
  it("rejects a minPriceMinor greater than maxPriceMinor", () => {
    const result = productFiltersSchema.safeParse({ minPriceMinor: 10000, maxPriceMinor: 5000 });
    expect(result.success).toBe(false);
  });

  it("defaults pagination fields", () => {
    const result = productFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(24);
    }
  });
});
