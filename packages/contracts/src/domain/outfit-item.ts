import { z } from "zod";

import { categorySchema } from "./category.js";

export const outfitItemSchema = z
  .object({
    productId: z.string().uuid(),
    category: categorySchema,
    selectedColor: z.string().min(1),
    selectedSize: z.string().min(1),
  })
  .strict();

export type OutfitItem = z.infer<typeof outfitItemSchema>;
