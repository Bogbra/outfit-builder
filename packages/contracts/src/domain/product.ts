import { z } from "zod";

import { categorySchema } from "./category.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const availabilitySchema = z.enum(["in_stock", "low_stock", "out_of_stock"]);
export type Availability = z.infer<typeof availabilitySchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).regex(SLUG_PATTERN, "must be a URL-safe slug"),
  description: z.string().max(2000),
  category: categorySchema,
  price: z.number().nonnegative(),
  currency: z.string().length(3),
  images: z.array(z.string().url()).min(1),
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

// docs/04-api-contract.md GraphQL `products` query filters, plus pagination
// (docs/08-performance.md: never load the full catalog at once).
export const productFiltersSchema = z
  .object({
    category: categorySchema.optional(),
    color: z.string().min(1).optional(),
    size: z.string().min(1).optional(),
    style: z.string().min(1).optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
    search: z.string().max(200).optional(),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(24),
  })
  .refine((data) => data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= data.maxPrice, {
    message: "minPrice must be less than or equal to maxPrice",
    path: ["minPrice"],
  });

export type ProductFilters = z.infer<typeof productFiltersSchema>;

// docs/04-api-contract.md POST/PATCH /api/admin/products. `.strict()` rejects
// unknown fields per docs/07-security.md.
export const adminProductFormSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).regex(SLUG_PATTERN, "must be a URL-safe slug"),
  description: z.string().max(2000),
  category: categorySchema,
  price: z.number().nonnegative(),
  currency: z.string().length(3),
  images: z.array(z.string().url()).min(1, "Add at least one image URL"),
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
