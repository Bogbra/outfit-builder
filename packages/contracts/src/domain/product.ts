import { z } from "zod";

import { categorySchema } from "./category.js";
import { ALLOWED_IMAGE_HOSTS, isAllowedImageUrl } from "./image-hosts.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Prisma's Int column is Postgres's 32-bit integer (max 2,147,483,647).
// This is a business ceiling well under that, not just a defensive cap —
// summed across a full 6-item outfit (see category.ts) it's still an order
// of magnitude below the int4 limit, so a saved outfit's totalPriceMinor
// (calculateOutfitTotalPrice in logic/price.ts) can never overflow either.
export const MAX_PRICE_MINOR = 10_000_000; // €100,000.00

const imageUrlSchema = z
  .string()
  .url()
  .refine(isAllowedImageUrl, (value) => {
    const host = URL.canParse(value) ? new URL(value).hostname : value;
    return {
      message: `Image host "${host}" is not allowed. Allowed hosts (https only): ${ALLOWED_IMAGE_HOSTS.join(", ")}`,
    };
  });

export const availabilitySchema = z.enum(["in_stock", "low_stock", "out_of_stock"]);
export type Availability = z.infer<typeof availabilitySchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).regex(SLUG_PATTERN, "must be a URL-safe slug"),
  description: z.string().max(2000),
  category: categorySchema,
  // Integer minor units (cents) — see calculateOutfitTotalPrice in
  // logic/price.ts for why this isn't a Float.
  priceMinor: z.number().int().nonnegative().max(MAX_PRICE_MINOR),
  currency: z.string().length(3),
  images: z.array(imageUrlSchema).min(1),
  colors: z.array(z.string().min(1)).min(1),
  sizes: z.array(z.string().min(1)).min(1),
  styleTags: z.array(z.string().min(1)),
  material: z.string().min(1).max(120),
  availability: availabilitySchema,
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Product = z.infer<typeof productSchema>;

// GraphQL `products` query filters, plus pagination — the full catalog
// should never be loaded at once.
export const productFiltersSchema = z
  .object({
    category: categorySchema.optional(),
    color: z.string().min(1).optional(),
    size: z.string().min(1).optional(),
    style: z.string().min(1).optional(),
    minPriceMinor: z.number().int().nonnegative().optional(),
    maxPriceMinor: z.number().int().nonnegative().optional(),
    search: z.string().max(200).optional(),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(24),
  })
  .refine(
    (data) => data.minPriceMinor === undefined || data.maxPriceMinor === undefined || data.minPriceMinor <= data.maxPriceMinor,
    {
      message: "minPriceMinor must be less than or equal to maxPriceMinor",
      path: ["minPriceMinor"],
    },
  );

export type ProductFilters = z.infer<typeof productFiltersSchema>;

// Input for POST/PATCH /api/admin/products. `.strict()` rejects unknown
// fields so unexpected properties fail validation instead of being
// silently dropped or persisted.
export const adminProductFormSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).regex(SLUG_PATTERN, "must be a URL-safe slug"),
  description: z.string().max(2000),
  category: categorySchema,
  priceMinor: z.number().int().nonnegative().max(MAX_PRICE_MINOR),
  currency: z.string().length(3),
  images: z.array(imageUrlSchema).min(1, "Add at least one image URL"),
  colors: z.array(z.string().min(1)).min(1, "Add at least one color"),
  sizes: z.array(z.string().min(1)).min(1, "Add at least one size"),
  styleTags: z.array(z.string().min(1)).default([]),
  material: z.string().min(1).max(120),
  availability: availabilitySchema,
  isActive: z.boolean().default(true),
}).strict();

export type AdminProductFormInput = z.infer<typeof adminProductFormSchema>;

// PATCH /api/admin/products/:id — every field optional (only supplied
// fields change); intentionally does not re-apply the create schema's
// defaults, since an absent field here means "leave unchanged", not
// "reset to default".
export const adminProductUpdateSchema = adminProductFormSchema.partial().strict();

export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;
