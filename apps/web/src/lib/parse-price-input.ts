import { MAX_PRICE_MINOR } from "@outfit-builder/contracts";
import { z } from "zod";

// Derived from the shared domain bound (packages/contracts/src/domain/product.ts)
// so the form's limit can never drift from what the server actually accepts.
export const MAX_PRICE_MAJOR = MAX_PRICE_MINOR / 100;

// Whole or up-to-2-decimal-place amount, no sign, no scientific notation —
// "49", "49.9", "49.90" are valid; "-5", "49.999", "1e10", "" are not.
const PRICE_INPUT_PATTERN = /^\d+(\.\d{1,2})?$/;

// Parses a price as a user would type it (major units, e.g. "49.90") into
// integer minor units (cents) — the representation prices are actually
// stored in (see calculateOutfitTotalPrice in
// packages/contracts/src/logic/price.ts for why). Used anywhere a person
// types a price: the admin product form and the catalog price filter.
export const priceInputSchema = z
  .string()
  .trim()
  .regex(
    PRICE_INPUT_PATTERN,
    "Enter a price like 49 or 49.90 (whole numbers or up to 2 decimal places, no negative values)",
  )
  .transform((value) => {
    // Builds the integer cent value directly from the whole/decimal digit
    // strings the regex above already guarantees — no float multiplication
    // (e.g. Number(value) * 100) anywhere in the money path.
    const [wholePart, decimalPart = ""] = value.split(".");
    return Number(wholePart) * 100 + Number(decimalPart.padEnd(2, "0"));
  })
  .refine((valueMinor) => valueMinor <= MAX_PRICE_MAJOR * 100, `Price must be ${MAX_PRICE_MAJOR.toLocaleString()} or less`);

export type ParsePriceInputResult = { success: true; valueMinor: number } | { success: false; error: string };

export function parsePriceInputToMinor(value: string): ParsePriceInputResult {
  const result = priceInputSchema.safeParse(value);
  if (result.success) {
    return { success: true, valueMinor: result.data };
  }
  return { success: false, error: result.error.issues[0]?.message ?? "Invalid price" };
}
