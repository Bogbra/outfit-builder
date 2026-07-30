import { z } from "zod";

import { outfitItemSchema } from "./outfit-item.js";

export const validationStatusSchema = z.enum(["complete", "incomplete"]);
export type ValidationStatus = z.infer<typeof validationStatusSchema>;

export const outfitSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  items: z.array(outfitItemSchema),
  totalPrice: z.number().nonnegative(),
  // Nullable because an empty outfit has no price and therefore no
  // currency (see calculateOutfitTotalPrice in logic/price.ts).
  currency: z.string().length(3).nullable(),
  styleTags: z.array(z.string()),
  validationStatus: validationStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Outfit = z.infer<typeof outfitSchema>;

// docs/04-api-contract.md POST /api/outfits. One item per category — the
// same category cannot appear twice in a single outfit.
export const createOutfitInputSchema = z
  .object({
    name: z.string().min(1).max(120),
    items: z
      .array(outfitItemSchema)
      .min(1)
      .refine((items) => new Set(items.map((item) => item.category)).size === items.length, {
        message: "Only one item per category is allowed",
      }),
  })
  .strict();

export type CreateOutfitInput = z.infer<typeof createOutfitInputSchema>;
