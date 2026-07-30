import { z } from "zod";

import { categorySchema } from "./category.js";

// docs/04-api-contract.md POST /api/try-on. Client sends product ids/categories,
// never a garment image URL directly — the server resolves the real product
// image itself, the same "never trust client-submitted data" principle
// createOutfitInputSchema follows for price. Max 6: one per Category.
export const tryOnRequestInputSchema = z
  .object({
    photo: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/, "photo must be a base64 image data URL"),
    items: z
      .array(z.object({ productId: z.string().uuid(), category: categorySchema }))
      .min(1)
      .max(6)
      .refine((items) => new Set(items.map((item) => item.category)).size === items.length, {
        message: "Only one item per category is allowed",
      }),
  })
  .strict();

export type TryOnRequestInput = z.infer<typeof tryOnRequestInputSchema>;

export const tryOnStatusSchema = z.enum(["processing", "completed", "failed"]);
export type TryOnStatus = z.infer<typeof tryOnStatusSchema>;

export const tryOnResponseSchema = z.object({
  id: z.string().uuid(),
  status: tryOnStatusSchema,
  step: z.number().int().nonnegative(),
  totalSteps: z.number().int().positive(),
  resultImageUrl: z.string().url().nullable(),
  error: z.string().nullable(),
});

export type TryOnResponse = z.infer<typeof tryOnResponseSchema>;
