import { categorySchema, type Category } from "@outfit-builder/contracts";

import type { CatalogFilters } from "../api/get-products";
import { parsePriceInputToMinor } from "@/lib/parse-price-input";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCategory(value: string | undefined): Category | undefined {
  if (!value) return undefined;
  const result = categorySchema.safeParse(value);
  return result.success ? result.data : undefined;
}

function parseNonNegativeNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  const parsed = parseNonNegativeNumber(value);
  return parsed !== undefined && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

// URL params stay in major units ("50" meaning $50) since they're
// user-facing/shareable; converted to integer minor units here, at the
// boundary into CatalogFilters, same as the admin product form does for
// its price input. An invalid value (e.g. a hand-edited or stale bookmarked
// URL) just drops the filter rather than erroring — there's no form field
// here to show a validation message against.
function parsePriceParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const result = parsePriceInputToMinor(value);
  return result.success ? result.valueMinor : undefined;
}

export function parseCatalogSearchParams(searchParams: RawSearchParams): CatalogFilters {
  return {
    category: parseCategory(firstValue(searchParams.category)),
    color: firstValue(searchParams.color) || undefined,
    size: firstValue(searchParams.size) || undefined,
    style: firstValue(searchParams.style) || undefined,
    minPriceMinor: parsePriceParam(firstValue(searchParams.minPrice)),
    maxPriceMinor: parsePriceParam(firstValue(searchParams.maxPrice)),
    search: firstValue(searchParams.search) || undefined,
    page: parsePositiveInt(firstValue(searchParams.page)),
  };
}
