import { z } from "zod";

export const categorySchema = z.enum(["top", "bottom", "shoes", "jacket", "bag", "accessory"]);

export type Category = z.infer<typeof categorySchema>;

// An outfit needs a top, bottom and shoes; jacket/bag/accessory are
// optional.
export const REQUIRED_CATEGORIES: readonly Category[] = ["top", "bottom", "shoes"];
export const OPTIONAL_CATEGORIES: readonly Category[] = ["jacket", "bag", "accessory"];
