import { z } from "zod";

export const categorySchema = z.enum(["top", "bottom", "shoes", "jacket", "bag", "accessory"]);

export type Category = z.infer<typeof categorySchema>;

// An outfit needs a top, bottom and shoes; jacket/bag/accessory are
// optional.
export const REQUIRED_CATEGORIES: readonly Category[] = ["top", "bottom", "shoes"];
export const OPTIONAL_CATEGORIES: readonly Category[] = ["jacket", "bag", "accessory"];

// fashn.ai's tryon-v1.6 model (the one this app calls — see fashn-client.ts)
// only documents auto/tops/bottoms/one-pieces as valid categories; it's
// built for garments, not footwear/bags/jewelry. Shoes, bags and
// accessories are excluded from the try-on chain entirely (both the
// dialog UI and the server-side item filter in try-on-repository.ts)
// rather than sent through a model that isn't designed for them. fashn.ai
// does offer a separate "Try-On Max" model documented to support those
// product types, which this app doesn't currently integrate.
export const TRY_ON_ELIGIBLE_CATEGORIES: readonly Category[] = ["top", "bottom", "jacket"];
